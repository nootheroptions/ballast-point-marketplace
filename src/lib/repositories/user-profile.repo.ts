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
  };
}
