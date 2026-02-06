import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export type AvailabilityCreateInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  teamMemberId: string;
  serviceId?: string | null;
};

export type AvailabilityUpdateInput = {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  serviceId?: string | null;
};

export const availabilityRepo = {
  /**
   * Find all availability for a team member
   */
  findByTeamMember: async (
    teamMemberId: string,
    serviceId?: string | null,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;
    return db.availability.findMany({
      where: {
        teamMemberId,
        serviceId: serviceId ?? null,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  },

  /**
   * Find availability for multiple team members
   */
  findByTeamMembers: async (
    teamMemberIds: string[],
    serviceId?: string | null,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;
    return db.availability.findMany({
      where: {
        teamMemberId: { in: teamMemberIds },
        serviceId: serviceId ?? null,
      },
      include: {
        teamMember: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ teamMemberId: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  },

  /**
   * Find availability for a service (includes service-specific and default availability)
   */
  findByService: async (serviceId: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.availability.findMany({
      where: {
        OR: [{ serviceId }, { serviceId: null }],
        // Scope to the provider team that owns this service.
        // Without this, `serviceId: null` (default) availability would be pulled for every team member
        // in the entire database.
        teamMember: {
          team: {
            providerProfile: {
              services: {
                some: { id: serviceId },
              },
            },
          },
        },
      },
      include: {
        teamMember: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [{ teamMemberId: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  },

  /**
   * Create a single availability entry
   */
  create: async (data: AvailabilityCreateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.availability.create({
      data,
    });
  },

  /**
   * Create multiple availability entries (bulk)
   */
  createMany: async (data: AvailabilityCreateInput[], tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.availability.createMany({
      data,
    });
  },

  /**
   * Update an availability entry
   */
  update: async (id: string, data: AvailabilityUpdateInput, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.availability.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a single availability entry
   */
  delete: async (id: string, tx?: Prisma.TransactionClient) => {
    const db = tx ?? prisma;
    return db.availability.delete({
      where: { id },
    });
  },

  /**
   * Delete all availability for a team member (optionally scoped to a service)
   */
  deleteByTeamMember: async (
    teamMemberId: string,
    serviceId?: string | null,
    tx?: Prisma.TransactionClient
  ) => {
    const db = tx ?? prisma;
    return db.availability.deleteMany({
      where: {
        teamMemberId,
        serviceId: serviceId ?? null,
      },
    });
  },

  /**
   * Replace all availability for a team member (delete + create in transaction)
   */
  replaceForTeamMember: async (
    teamMemberId: string,
    newAvailability: AvailabilityCreateInput[],
    serviceId?: string | null
  ) => {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing availability
      await availabilityRepo.deleteByTeamMember(teamMemberId, serviceId, tx);

      // Create new availability
      if (newAvailability.length > 0) {
        await availabilityRepo.createMany(newAvailability, tx);
      }

      // Return updated availability
      return availabilityRepo.findByTeamMember(teamMemberId, serviceId, tx);
    });
  },
};
