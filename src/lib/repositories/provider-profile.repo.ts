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
 * ProviderProfile repository abstraction
 * Encapsulates database operations for provider profiles
 */
export interface ProviderProfileRepository {
  /**
   * Find a provider profile by slug
   * @param slug - The URL-friendly slug
   * @param tx - Optional transaction client
   * @returns The provider profile if exists, null otherwise
   */
  findBySlug(slug: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null>;

  /**
   * Create a new provider profile
   * @param data - The provider profile data
   * @param tx - Optional transaction client
   * @returns The created provider profile
   */
  create(data: CreateProviderProfileData, tx?: Prisma.TransactionClient): Promise<ProviderProfile>;
}

/**
 * Creates a Prisma-based ProviderProfile repository
 * @returns ProviderProfileRepository implementation
 */
export function createProviderProfileRepository(): ProviderProfileRepository {
  return {
    async findBySlug(slug: string, tx?: Prisma.TransactionClient): Promise<ProviderProfile | null> {
      const client = tx ?? prisma;
      return await client.providerProfile.findUnique({
        where: { slug },
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
  };
}
