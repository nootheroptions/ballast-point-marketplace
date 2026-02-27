import { z } from 'zod';
import { isValidTimezone } from '@/lib/utils/timezone';

/**
 * Schema for creating a payment intent for a booking
 */
export const createPaymentIntentSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
});

export type CreatePaymentIntentData = z.infer<typeof createPaymentIntentSchema>;

/**
 * Schema for confirming a booking with payment
 */
export const confirmBookingWithPaymentSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  // Invitee information
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export type ConfirmBookingWithPaymentData = z.infer<typeof confirmBookingWithPaymentSchema>;

/**
 * Schema for getting payment status
 */
export const getPaymentStatusSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

export type GetPaymentStatusData = z.infer<typeof getPaymentStatusSchema>;

/**
 * Schema for initiating Stripe Connect onboarding
 */
export const connectStripeAccountSchema = z.object({
  /** Optional: URL to redirect to after onboarding */
  returnUrl: z.string().url().optional(),
});

export type ConnectStripeAccountData = z.infer<typeof connectStripeAccountSchema>;

/**
 * Schema for creating a Stripe onboarding link
 */
export const createOnboardingLinkSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
  refreshUrl: z.string().url('Invalid refresh URL'),
});

export type CreateOnboardingLinkData = z.infer<typeof createOnboardingLinkSchema>;
