import type { Prisma, BookingStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export type BookingCreateInput = {
  startTime: Date;
  endTime: Date;
  timezone: string;
  serviceId: string;
  notes?: string;
  status?: BookingStatus;
  participants: {
    role: 'HOST' | 'CO_HOST' | 'INVITEE';
    teamMemberId?: string;
    userId?: string;
    email?: string;
    name?: string;
  }[];
};

export type BookingUpdateInput = {
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  notes?: string;
  status?: BookingStatus;
  cancelledAt?: Date | null;
};

export const bookingRepo = {
  /**
   * Find booking by ID
   */
  findById: async (id: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.booking.findUnique({
      where: { id },
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Find bookings by service
   */
  findByService: async (
    serviceId: string,
    options?: {
      status?: BookingStatus | BookingStatus[];
      startAfter?: Date;
      startBefore?: Date;
    },
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;

    const whereClause: Prisma.BookingWhereInput = {
      serviceId,
    };

    if (options?.status) {
      whereClause.status = Array.isArray(options.status) ? { in: options.status } : options.status;
    }

    if (options?.startAfter || options?.startBefore) {
      whereClause.startTime = {};
      if (options.startAfter) {
        whereClause.startTime.gte = options.startAfter;
      }
      if (options.startBefore) {
        whereClause.startTime.lte = options.startBefore;
      }
    }

    return db.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  /**
   * Find bookings by team member
   */
  findByTeamMember: async (
    teamMemberId: string,
    options?: {
      status?: BookingStatus | BookingStatus[];
      startAfter?: Date;
      startBefore?: Date;
    },
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;

    const whereClause: Prisma.BookingWhereInput = {
      participants: {
        some: {
          teamMemberId,
        },
      },
    };

    if (options?.status) {
      whereClause.status = Array.isArray(options.status) ? { in: options.status } : options.status;
    }

    if (options?.startAfter || options?.startBefore) {
      whereClause.startTime = {};
      if (options.startAfter) {
        whereClause.startTime.gte = options.startAfter;
      }
      if (options.startBefore) {
        whereClause.startTime.lte = options.startBefore;
      }
    }

    return db.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  /**
   * Find bookings by provider profile ID
   * Gets all bookings across all services for a provider
   */
  findByProviderId: async (
    providerProfileId: string,
    options?: {
      status?: BookingStatus | BookingStatus[];
      startAfter?: Date;
      startBefore?: Date;
    },
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;

    const whereClause: Prisma.BookingWhereInput = {
      service: {
        providerProfileId,
      },
    };

    if (options?.status) {
      whereClause.status = Array.isArray(options.status) ? { in: options.status } : options.status;
    }

    if (options?.startAfter || options?.startBefore) {
      whereClause.startTime = {};
      if (options.startAfter) {
        whereClause.startTime.gte = options.startAfter;
      }
      if (options.startBefore) {
        whereClause.startTime.lte = options.startBefore;
      }
    }

    return db.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  /**
   * Find bookings within a date range for a service
   * Used for checking conflicts and calculating availability
   */
  findByServiceAndDateRange: async (
    serviceId: string,
    startTime: Date,
    endTime: Date,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;
    return db.booking.findMany({
      where: {
        serviceId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        OR: [
          // Booking starts within the range
          {
            startTime: {
              gte: startTime,
              lt: endTime,
            },
          },
          // Booking ends within the range
          {
            endTime: {
              gt: startTime,
              lte: endTime,
            },
          },
          // Booking spans the entire range
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            teamMember: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  },

  /**
   * Create a booking with participants
   */
  create: async (data: BookingCreateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;

    const { participants, ...bookingData } = data;

    return db.booking.create({
      data: {
        ...bookingData,
        participants: {
          create: participants,
        },
      },
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Update a booking
   */
  update: async (id: string, data: BookingUpdateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.booking.update({
      where: { id },
      data,
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Cancel a booking
   */
  cancel: async (id: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        service: true,
        participants: {
          include: {
            teamMember: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Delete a booking (hard delete)
   */
  delete: async (id: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.booking.delete({
      where: { id },
    });
  },
};
