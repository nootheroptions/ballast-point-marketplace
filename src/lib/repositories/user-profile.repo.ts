import { prisma } from '@/lib/db/prisma';
import { UserProfile } from '@prisma/client';

/**
 * Data required to create a user profile
 */
export interface CreateUserProfileData {
  id: string;
  email: string;
}

/**
 * User profile with provider information
 */
export interface UserProfileWithProvider {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  teamMemberships: {
    team: {
      providerProfile: {
        slug: string;
      } | null;
    } | null;
  }[];
}

/**
 * UserProfile repository abstraction
 * Encapsulates database operations for user profiles
 */
export interface UserProfileRepository {
  /**
   * Create a new user profile
   * @param data - The user profile data
   * @returns The created user profile
   */
  create(data: CreateUserProfileData): Promise<UserProfile>;

  /**
   * Find a user profile by ID with team memberships and provider profile
   * @param userId - The user ID
   * @returns The user profile with provider information, or null if not found
   */
  findByIdWithProvider(userId: string): Promise<UserProfileWithProvider | null>;
}

/**
 * Creates a Prisma-based UserProfile repository
 * @returns UserProfileRepository implementation
 */
export function createUserProfileRepository(): UserProfileRepository {
  return {
    async create(data: CreateUserProfileData): Promise<UserProfile> {
      return await prisma.userProfile.create({
        data: {
          id: data.id,
          email: data.email,
        },
      });
    },

    async findByIdWithProvider(userId: string): Promise<UserProfileWithProvider | null> {
      return await prisma.userProfile.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          teamMemberships: {
            select: {
              team: {
                select: {
                  providerProfile: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
        },
      });
    },
  };
}
