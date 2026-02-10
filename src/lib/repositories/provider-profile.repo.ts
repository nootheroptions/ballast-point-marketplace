import { prisma } from '@/lib/db/prisma';
import { Prisma, ProviderProfile } from '@prisma/client';

/**
 * Data required to create a provider profile
 */
export interface CreateProviderProfileData {
  teamId: string;
  name: string;
  slug: string;
  description?: string | null;
}

/**
 * Data for updating a provider profile
 */
export interface UpdateProviderProfileData {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  imageUrls?: string[];
}

/**
 * ProviderProfile with team members
 */
export type ProviderProfileWithTeamMembers = ProviderProfile & {
  team: {
    members: Array<{
      userId: string;
      role: string;
    }>;
  };
};

/**
 * ProviderProfile repository abstraction
 * Encapsulates database operations for provider profiles
 */
export interface ProviderProfileRepository {
  /**
   * Find a provider profile by ID
   * @param id - The provider profile ID
   * @param tx - Optional transaction client
   * @returns The provider profile if exists, null otherwise
   */
  findById(id: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null>;

  /**
   * Find a provider profile by ID with team members
   * @param id - The provider profile ID
   * @param userId - Optional user ID to filter team members
   * @param tx - Optional transaction client
   * @returns The provider profile with team members if exists, null otherwise
   */
  findByIdWithTeamMembers(
    id: string,
    userId?: string,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderProfileWithTeamMembers | null>;

  /**
   * Find a provider profile by slug
   * @param slug - The URL-friendly slug
   * @param tx - Optional transaction client
   * @returns The provider profile if exists, null otherwise
   */
  findBySlug(slug: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null>;

  /**
   * Find a provider profile by team ID
   * @param teamId - The team ID
   * @param tx - Optional transaction client
   * @returns The provider profile if exists, null otherwise
   */
  findByTeamId(teamId: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null>;

  /**
   * Create a new provider profile
   * @param data - The provider profile data
   * @param tx - Optional transaction client
   * @returns The created provider profile
   */
  create(data: CreateProviderProfileData, tx?: Prisma.TransactionClient): Promise<ProviderProfile>;

  /**
   * Update a provider profile
   * @param id - The provider profile ID
   * @param data - The updated provider profile data
   * @param tx - Optional transaction client
   * @returns The updated provider profile
   */
  update(
    id: string,
    data: UpdateProviderProfileData,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderProfile>;
}

/**
 * Creates a Prisma-based ProviderProfile repository
 * @returns ProviderProfileRepository implementation
 */
export function createProviderProfileRepository(): ProviderProfileRepository {
  return {
    async findById(id: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null> {
      const client = tx ?? prisma;
      return await client.providerProfile.findUnique({
        where: { id },
      });
    },

    async findByIdWithTeamMembers(
      id: string,
      userId?: string,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderProfileWithTeamMembers | null> {
      const client = tx ?? prisma;
      return await client.providerProfile.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: userId
                ? {
                    where: { userId },
                    select: {
                      userId: true,
                      role: true,
                    },
                  }
                : {
                    select: {
                      userId: true,
                      role: true,
                    },
                  },
            },
          },
        },
      });
    },

    async findBySlug(slug: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null> {
      const client = tx ?? prisma;
      return await client.providerProfile.findUnique({
        where: { slug },
      });
    },

    async findByTeamId(
      teamId: string,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderProfile | null> {
      const client = tx ?? prisma;
      return await client.providerProfile.findUnique({
        where: { teamId },
      });
    },

    async create(
      data: CreateProviderProfileData,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderProfile> {
      const client = tx ?? prisma;
      return await client.providerProfile.create({
        data: {
          team: {
            connect: {
              id: data.teamId,
            },
          },
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      });
    },

    async update(
      id: string,
      data: UpdateProviderProfileData,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderProfile> {
      const client = tx ?? prisma;
      return await client.providerProfile.update({
        where: { id },
        data,
      });
    },
  };
}
