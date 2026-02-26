import { prisma } from '@/lib/db/prisma';
import { CalendarIntegration, CalendarProvider, Prisma } from '@prisma/client';

/**
 * Data required to create a calendar integration
 */
export interface CreateCalendarIntegrationData {
  teamMemberId: string;
  provider: CalendarProvider;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  calendarId: string;
  calendarEmail?: string;
}

/**
 * Data for updating token information
 */
export interface UpdateTokensData {
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

/**
 * CalendarIntegration repository abstraction
 * Encapsulates database operations for external calendar integrations
 */
export interface CalendarIntegrationRepository {
  /**
   * Find a calendar integration by team member ID
   * @param teamMemberId - The team member's ID
   * @param tx - Optional transaction client
   */
  findByTeamMemberId(
    teamMemberId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CalendarIntegration | null>;

  /**
   * Find all calendar integrations for a list of team member IDs
   * @param teamMemberIds - Array of team member IDs
   * @param tx - Optional transaction client
   */
  findByTeamMemberIds(
    teamMemberIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<CalendarIntegration[]>;

  /**
   * Create a new calendar integration
   * @param data - The calendar integration data
   * @param tx - Optional transaction client
   */
  create(
    data: CreateCalendarIntegrationData,
    tx?: Prisma.TransactionClient
  ): Promise<CalendarIntegration>;

  /**
   * Update an existing calendar integration's tokens
   * @param id - The integration ID
   * @param data - The token data to update
   * @param tx - Optional transaction client
   */
  updateTokens(
    id: string,
    data: UpdateTokensData,
    tx?: Prisma.TransactionClient
  ): Promise<CalendarIntegration>;

  /**
   * Update sync status
   * @param id - The integration ID
   * @param lastSyncAt - When the sync occurred
   * @param syncError - Optional error message
   * @param tx - Optional transaction client
   */
  updateSyncStatus(
    id: string,
    lastSyncAt: Date,
    syncError?: string,
    tx?: Prisma.TransactionClient
  ): Promise<CalendarIntegration>;

  /**
   * Delete a calendar integration
   * @param id - The integration ID
   * @param tx - Optional transaction client
   */
  delete(id: string, tx?: Prisma.TransactionClient): Promise<void>;

  /**
   * Delete a calendar integration by team member ID
   * @param teamMemberId - The team member's ID
   * @param tx - Optional transaction client
   */
  deleteByTeamMemberId(teamMemberId: string, tx?: Prisma.TransactionClient): Promise<void>;
}

/**
 * Creates a Prisma-based CalendarIntegration repository
 * @returns CalendarIntegrationRepository implementation
 */
export function createCalendarIntegrationRepository(): CalendarIntegrationRepository {
  return {
    async findByTeamMemberId(
      teamMemberId: string,
      tx?: Prisma.TransactionClient
    ): Promise<CalendarIntegration | null> {
      const client = tx ?? prisma;
      return await client.calendarIntegration.findUnique({
        where: { teamMemberId },
      });
    },

    async findByTeamMemberIds(
      teamMemberIds: string[],
      tx?: Prisma.TransactionClient
    ): Promise<CalendarIntegration[]> {
      const client = tx ?? prisma;
      return await client.calendarIntegration.findMany({
        where: {
          teamMemberId: { in: teamMemberIds },
        },
      });
    },

    async create(
      data: CreateCalendarIntegrationData,
      tx?: Prisma.TransactionClient
    ): Promise<CalendarIntegration> {
      const client = tx ?? prisma;
      return await client.calendarIntegration.create({
        data: {
          teamMember: {
            connect: { id: data.teamMemberId },
          },
          provider: data.provider,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenExpiry: data.tokenExpiry,
          calendarId: data.calendarId,
          calendarEmail: data.calendarEmail,
        },
      });
    },

    async updateTokens(
      id: string,
      data: UpdateTokensData,
      tx?: Prisma.TransactionClient
    ): Promise<CalendarIntegration> {
      const client = tx ?? prisma;
      return await client.calendarIntegration.update({
        where: { id },
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tokenExpiry: data.tokenExpiry,
        },
      });
    },

    async updateSyncStatus(
      id: string,
      lastSyncAt: Date,
      syncError?: string,
      tx?: Prisma.TransactionClient
    ): Promise<CalendarIntegration> {
      const client = tx ?? prisma;
      return await client.calendarIntegration.update({
        where: { id },
        data: {
          lastSyncAt,
          syncError: syncError ?? null,
        },
      });
    },

    async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
      const client = tx ?? prisma;
      await client.calendarIntegration.delete({
        where: { id },
      });
    },

    async deleteByTeamMemberId(teamMemberId: string, tx?: Prisma.TransactionClient): Promise<void> {
      const client = tx ?? prisma;
      await client.calendarIntegration.deleteMany({
        where: { teamMemberId },
      });
    },
  };
}
