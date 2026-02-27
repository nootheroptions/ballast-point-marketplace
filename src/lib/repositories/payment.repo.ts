import type { Prisma, PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export type PaymentCreateInput = {
  bookingId: string;
  stripePaymentIntentId: string;
  amountCents: number;
  platformFeeCents: number;
  currency?: string;
  status?: PaymentStatus;
};

export type PaymentUpdateInput = {
  status?: PaymentStatus;
  paidAt?: Date | null;
};

export const paymentRepo = {
  /**
   * Find payment by ID
   */
  findById: async (id: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Find payment by booking ID
   */
  findByBookingId: async (bookingId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Find payment by Stripe Payment Intent ID
   */
  findByPaymentIntentId: async (stripePaymentIntentId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.findUnique({
      where: { stripePaymentIntentId },
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Create a payment record
   */
  create: async (data: PaymentCreateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.create({
      data: {
        bookingId: data.bookingId,
        stripePaymentIntentId: data.stripePaymentIntentId,
        amountCents: data.amountCents,
        platformFeeCents: data.platformFeeCents,
        currency: data.currency ?? 'aud',
        status: data.status ?? 'PENDING',
      },
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Update a payment
   */
  update: async (id: string, data: PaymentUpdateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.update({
      where: { id },
      data,
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Update payment status by Stripe Payment Intent ID
   * Used by webhook handlers
   */
  updateByPaymentIntentId: async (
    stripePaymentIntentId: string,
    data: PaymentUpdateInput,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;
    return db.payment.update({
      where: { stripePaymentIntentId },
      data,
      include: {
        booking: {
          include: {
            service: {
              include: {
                providerProfile: true,
              },
            },
            participants: true,
          },
        },
      },
    });
  },

  /**
   * Mark payment as succeeded
   */
  markSucceeded: async (stripePaymentIntentId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.update({
      where: { stripePaymentIntentId },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
      },
    });
  },

  /**
   * Mark payment as failed
   */
  markFailed: async (stripePaymentIntentId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.update({
      where: { stripePaymentIntentId },
      data: {
        status: 'FAILED',
      },
    });
  },

  /**
   * Mark payment as refunded
   */
  markRefunded: async (stripePaymentIntentId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.payment.update({
      where: { stripePaymentIntentId },
      data: {
        status: 'REFUNDED',
      },
    });
  },
};
