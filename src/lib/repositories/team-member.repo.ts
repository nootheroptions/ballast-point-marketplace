import { prisma } from '@/lib/db/prisma';
import { Prisma, TeamMember, TeamRole } from '@prisma/client';

/**
 * Team membership information
 */
export interface TeamMembershipInfo {
  teamId: string;
}

/**
 * Data required to create a team member
 */
export interface CreateTeamMemberData {
  userId: string;
  teamId: string;
  role: TeamRole;
}

/**
 * TeamMember repository abstraction
 * Encapsulates database operations for team memberships
 */
export interface TeamMemberRepository {
  /**
   * Get the first team membership for a user, ordered by creation date
   * @param userId - The user's ID
   * @param tx - Optional transaction client
   * @returns The team membership info if exists, null otherwise
   */
  getFirstTeamMembershipByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamMembershipInfo | null>;

  /**
   * Find a team member by user ID and team ID
   * @param userId - The user's ID
   * @param teamId - The team's ID
   * @param tx - Optional transaction client
   * @returns The team member if exists, null otherwise
   */
  findByUserAndTeam(
    userId: string,
    teamId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamMember | null>;

  /**
   * Create a new team member
   * @param data - The team member data
   * @param tx - Optional transaction client
   * @returns The created team member
   */
  create(data: CreateTeamMemberData, tx?: Prisma.TransactionClient): Promise<TeamMember>;
}

/**
 * Creates a Prisma-based TeamMember repository
 * @returns TeamMemberRepository implementation
 */
export function createTeamMemberRepository(): TeamMemberRepository {
  return {
    async getFirstTeamMembershipByUserId(
      userId: string,
      tx?: Prisma.TransactionClient
    ): Promise<TeamMembershipInfo | null> {
      const client = tx ?? prisma;
      const teamMembership = await client.teamMember.findFirst({
        where: { userId },
        select: { teamId: true },
        orderBy: { createdAt: 'asc' },
      });

      return teamMembership;
    },

    async findByUserAndTeam(
      userId: string,
      teamId: string,
      tx?: Prisma.TransactionClient
    ): Promise<TeamMember | null> {
      const client = tx ?? prisma;
      return await client.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      });
    },

    async create(data: CreateTeamMemberData, tx?: Prisma.TransactionClient): Promise<TeamMember> {
      const client = tx ?? prisma;
      return await client.teamMember.create({
        data: {
          user: {
            connect: {
              id: data.userId,
            },
          },
          team: {
            connect: {
              id: data.teamId,
            },
          },
          role: data.role,
        },
      });
    },
  };
}
