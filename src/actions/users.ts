'use server';

import { getCurrentUser } from '@/lib/auth/server-auth';
import { createUserProfileRepository } from '@/lib/repositories/user-profile.repo';

/**
 * Get the current authenticated user with provider profile information
 *
 * Checks if the user has any team memberships with an associated provider profile.
 * Returns user data along with provider status.
 *
 * @returns Object containing user data, hasProvider flag, and optional providerSlug
 */
export async function getUserWithProvider(): Promise<{
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
  hasProvider: boolean;
  providerSlug?: string;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, hasProvider: false };
  }

  const userProfileRepository = createUserProfileRepository();
  const userProfile = await userProfileRepository.findByIdWithProvider(user.id);

  if (!userProfile) {
    return { user: null, hasProvider: false };
  }

  // Find first team membership with a provider profile
  const provider = userProfile.teamMemberships.find((m) => m.team?.providerProfile)?.team
    ?.providerProfile;

  return {
    user: {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      avatarUrl: userProfile.avatarUrl,
    },
    hasProvider: !!provider,
    providerSlug: provider?.slug,
  };
}
