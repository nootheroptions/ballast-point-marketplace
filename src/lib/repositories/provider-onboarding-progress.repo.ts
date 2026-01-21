import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

/**
 * Onboarding progress data returned to clients
 */
export interface OnboardingProgressData {
  currentStep: number;
  name: string | null;
  slug: string | null;
  description: string | null;
}

/**
 * Data required to save/update onboarding progress
 */
export interface SaveOnboardingProgressData {
  userId: string;
  currentStep: number;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
}

/**
 * ProviderOnboardingProgress repository abstraction
 * Encapsulates database operations for onboarding progress tracking
 */
export interface ProviderOnboardingProgressRepository {
  /**
   * Find onboarding progress by user ID
   * @param userId - The user's ID
   * @param tx - Optional transaction client
   * @returns The onboarding progress data if exists, null otherwise
   */
  findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<OnboardingProgressData | null>;

  /**
   * Create or update onboarding progress for a user
   * @param data - The progress data to save
   * @param tx - Optional transaction client
   * @returns void
   */
  upsert(data: SaveOnboardingProgressData, tx?: Prisma.TransactionClient): Promise<void>;

  /**
   * Delete onboarding progress for a user
   * @param userId - The user's ID
   * @param tx - Optional transaction client
   * @returns void
   */
  deleteByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void>;
}

/**
 * Creates a Prisma-based ProviderOnboardingProgress repository
 * @returns ProviderOnboardingProgressRepository implementation
 */
export function createProviderOnboardingProgressRepository(): ProviderOnboardingProgressRepository {
  return {
    async findByUserId(
      userId: string,
      tx?: Prisma.TransactionClient
    ): Promise<OnboardingProgressData | null> {
      const client = tx ?? prisma;
      return await client.providerOnboardingProgress.findUnique({
        where: { userId },
        select: {
          currentStep: true,
          name: true,
          slug: true,
          description: true,
        },
      });
    },

    async upsert(data: SaveOnboardingProgressData, tx?: Prisma.TransactionClient): Promise<void> {
      const client = tx ?? prisma;
      await client.providerOnboardingProgress.upsert({
        where: { userId: data.userId },
        create: {
          user: {
            connect: {
              id: data.userId,
            },
          },
          currentStep: data.currentStep,
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
        update: {
          currentStep: data.currentStep,
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      });
    },

    async deleteByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void> {
      const client = tx ?? prisma;
      await client.providerOnboardingProgress.deleteMany({
        where: { userId },
      });
    },
  };
}
