import { prisma } from '@/lib/db/prisma';
import { Prisma, Team } from '@prisma/client';

/**
 * Team repository abstraction
 * Encapsulates database operations for teams
 */
export interface TeamRepository {
  /**
   * Create a new team
   * @param tx - Optional transaction client
   * @returns The created team
   */
  create(tx?: Prisma.TransactionClient): Promise<Team>;
}

/**
 * Creates a Prisma-based Team repository
 * @returns TeamRepository implementation
 */
export function createTeamRepository(): TeamRepository {
  return {
    async create(tx?: Prisma.TransactionClient): Promise<Team> {
      const client = tx ?? prisma;
      return await client.team.create({
        data: {},
      });
    },
  };
}
