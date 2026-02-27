'use server';

import { createAction } from '@/lib/auth/action-wrapper';
import { prisma } from '@/lib/db/prisma';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import { bookingRepo } from '@/lib/repositories/booking.repo';
import { paymentRepo } from '@/lib/repositories/payment.repo';
import { availabilityRepo } from '@/lib/repositories/availability.repo';
import {
  isSlotAvailable,
  normalizeAvailabilitiesForService,
} from '@/lib/utils/availability-slots-calculator';
import { createStripeService, calculatePlatformFee } from '@/lib/services/stripe';
import {
  createPaymentIntentSchema,
  confirmBookingWithPaymentSchema,
  getPaymentStatusSchema,
  type CreatePaymentIntentData,
  type ConfirmBookingWithPaymentData,
  type GetPaymentStatusData,
} from '@/lib/validations/payment';
import { Prisma } from '@prisma/client';
import { addMinutes } from 'date-fns';

const SLOT_UNAVAILABLE_ERROR = 'This time slot is no longer available';
const NO_AVAILABILITY_ERROR = 'No availability configured for this service';
const PAYMENT_MISMATCH_ERROR =
  'Payment details do not match this booking. Please start the booking flow again.';

function isSlotConflictError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.message === SLOT_UNAVAILABLE_ERROR || error.message === NO_AVAILABILITY_ERROR) {
      return true;
    }

    if (error.message.includes('bookings_no_overlap')) {
      return true;
    }
  }

  return false;
}

/**
 * Create a payment intent for a service booking
 * PUBLIC action - no authentication required
 *
 * This creates a Stripe payment intent and returns the client secret
 * for completing payment on the client side.
 */
export const createPaymentIntent = createAction(
  createPaymentIntentSchema,
  async (data: CreatePaymentIntentData) => {
    const { serviceId, startTime, timezone } = data;

    // Get service with provider profile (need Stripe account ID)
    const serviceRepo = createServiceRepository();
    const service = await serviceRepo.findById(serviceId);

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Get provider profile to check Stripe account
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: service.providerProfileId },
    });

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider not found',
      };
    }

    // Check provider has connected Stripe account
    if (!providerProfile.stripeAccountId) {
      return {
        success: false,
        error: 'This provider has not set up payments yet. Please contact them directly.',
      };
    }

    if (providerProfile.stripeAccountStatus !== 'ACTIVE') {
      return {
        success: false,
        error: 'This provider cannot accept payments at this time. Please contact them directly.',
      };
    }

    // Validate advance booking constraints
    const now = new Date();
    const earliestBookingTime = addMinutes(now, service.advanceBookingMin);
    const latestBookingTime = addMinutes(now, service.advanceBookingMax);

    if (startTime < earliestBookingTime) {
      return {
        success: false,
        error: `Bookings must be made at least ${service.advanceBookingMin} minutes in advance`,
      };
    }

    if (startTime > latestBookingTime) {
      return {
        success: false,
        error: `Bookings cannot be made more than ${service.advanceBookingMax} minutes in advance`,
      };
    }

    // Calculate end time from service configuration
    const endTime = addMinutes(startTime, service.slotDuration);

    // Check slot is still available
    const availabilities = await availabilityRepo.findByService(serviceId);
    const normalizedAvailabilities = normalizeAvailabilitiesForService(availabilities, serviceId);

    if (normalizedAvailabilities.length === 0) {
      return {
        success: false,
        error: 'No availability configured for this service',
      };
    }

    const existingBookings = await bookingRepo.findByServiceAndDateRange(
      serviceId,
      startTime,
      endTime
    );

    const available = isSlotAvailable(
      normalizedAvailabilities,
      existingBookings,
      startTime,
      endTime,
      {
        slotDuration: service.slotDuration,
        slotBuffer: service.slotBuffer,
      }
    );

    if (!available) {
      return {
        success: false,
        error: 'This time slot is no longer available. Please select a different time.',
      };
    }

    // Calculate platform fee (10%)
    const amountCents = service.priceCents;
    const platformFeeCents = calculatePlatformFee(amountCents);

    // Create payment intent
    const stripeService = createStripeService();
    const paymentIntent = await stripeService.createPaymentIntent({
      amountCents,
      currency: 'aud',
      connectedAccountId: providerProfile.stripeAccountId,
      platformFeeCents,
      description: `Booking: ${service.name} with ${providerProfile.name}`,
      metadata: {
        serviceId,
        providerProfileId: providerProfile.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timezone,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amountCents,
        platformFeeCents,
        currency: 'aud',
      },
    };
  }
);

/**
 * Confirm a booking after payment is successful
 * PUBLIC action - no authentication required
 *
 * This creates the booking record after verifying payment succeeded.
 * Uses serializable transaction to prevent double-booking.
 */
export const confirmBookingWithPayment = createAction(
  confirmBookingWithPaymentSchema,
  async (data: ConfirmBookingWithPaymentData) => {
    const { serviceId, startTime, timezone, paymentIntentId, name, email, notes } = data;

    // Get service
    const serviceRepo = createServiceRepository();
    const service = await serviceRepo.findById(serviceId);

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    const existingPayment = await paymentRepo.findByPaymentIntentId(paymentIntentId);
    if (existingPayment) {
      return {
        success: false,
        error: 'This payment has already been used for a booking.',
      };
    }

    // Calculate expected booking and payment values
    const endTime = addMinutes(startTime, service.slotDuration);
    const amountCents = service.priceCents;
    const platformFeeCents = calculatePlatformFee(amountCents);

    // Verify payment succeeded and exactly matches this booking details
    const stripeService = createStripeService();
    const paymentStatus = await stripeService.getPaymentIntentStatus(paymentIntentId);

    if (paymentStatus.status !== 'succeeded') {
      return {
        success: false,
        error: 'Payment has not been completed. Please complete payment first.',
      };
    }

    const paymentMatchesBooking =
      paymentStatus.amountCents === amountCents &&
      paymentStatus.currency.toLowerCase() === 'aud' &&
      paymentStatus.metadata.serviceId === serviceId &&
      paymentStatus.metadata.providerProfileId === service.providerProfileId &&
      paymentStatus.metadata.startTime === startTime.toISOString() &&
      paymentStatus.metadata.endTime === endTime.toISOString() &&
      paymentStatus.metadata.timezone === timezone;

    if (!paymentMatchesBooking) {
      return {
        success: false,
        error: PAYMENT_MISMATCH_ERROR,
      };
    }

    // Create booking with payment in transaction
    try {
      const booking = await prisma.$transaction(
        async (tx) => {
          // Double-check slot is still available
          const availabilities = await availabilityRepo.findByService(serviceId, tx);
          const normalizedAvailabilities = normalizeAvailabilitiesForService(
            availabilities,
            serviceId
          );

          if (normalizedAvailabilities.length === 0) {
            throw new Error(NO_AVAILABILITY_ERROR);
          }

          const existingBookings = await bookingRepo.findByServiceAndDateRange(
            serviceId,
            startTime,
            endTime,
            tx
          );

          const available = isSlotAvailable(
            normalizedAvailabilities,
            existingBookings,
            startTime,
            endTime,
            {
              slotDuration: service.slotDuration,
              slotBuffer: service.slotBuffer,
            }
          );

          if (!available) {
            throw new Error(SLOT_UNAVAILABLE_ERROR);
          }

          // Create booking
          const newBooking = await bookingRepo.create(
            {
              serviceId,
              startTime,
              endTime,
              timezone,
              notes: notes || undefined,
              participants: [
                {
                  role: 'INVITEE',
                  email,
                  name,
                },
              ],
            },
            tx
          );

          // Create payment record
          await paymentRepo.create(
            {
              bookingId: newBooking.id,
              stripePaymentIntentId: paymentIntentId,
              amountCents,
              platformFeeCents,
              currency: 'aud',
              status: 'SUCCEEDED',
            },
            tx
          );

          // Update payment with paidAt timestamp
          await tx.payment.update({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { paidAt: new Date() },
          });

          return newBooking;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );

      return {
        success: true,
        data: booking,
        message: 'Booking confirmed successfully',
      };
    } catch (error) {
      if (isSlotConflictError(error)) {
        try {
          await stripeService.refundPayment(paymentIntentId);
          return {
            success: false,
            error: 'This time slot is no longer available. Your payment has been refunded.',
          };
        } catch (refundError) {
          console.error('Failed to refund payment after slot conflict:', refundError);
          return {
            success: false,
            error:
              'This time slot is no longer available and we could not issue an automatic refund. Please contact support.',
          };
        }
      }

      throw error;
    }
  }
);

/**
 * Get payment status for a booking
 * PUBLIC action - no authentication required
 */
export const getPaymentStatus = createAction(
  getPaymentStatusSchema,
  async (data: GetPaymentStatusData) => {
    const { bookingId } = data;

    const payment = await paymentRepo.findByBookingId(bookingId);

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found for this booking',
      };
    }

    return {
      success: true,
      data: {
        status: payment.status,
        amountCents: payment.amountCents,
        platformFeeCents: payment.platformFeeCents,
        currency: payment.currency,
        paidAt: payment.paidAt,
      },
    };
  }
);
