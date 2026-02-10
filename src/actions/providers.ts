'use server';

import { cookies } from 'next/headers';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  updateProviderProfileSchema,
  type UpdateProviderProfileData,
} from '@/lib/validations/provider-profile';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import {
  requireProviderAdmin,
  ForbiddenError,
  NotFoundError,
} from '@/lib/auth/provider-authorization';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { toPublicProvider } from '@/lib/types/public-mappers';
import type { PublicProvider } from '@/lib/types/public';

/**
 * Get the current provider profile
 */
export const getProviderProfile = createAuthenticatedAction(async (user) => {
  // Get team ID from cookie
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected. Please complete provider onboarding first.',
    };
  }

  try {
    // Resolve provider profile from team ID
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found. Please complete provider onboarding first.',
      };
    }

    // Verify user has access to this provider
    await requireProviderAdmin(user, providerProfile.id);

    return providerProfile;
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }
    throw error;
  }
});

/**
 * Update the current provider profile
 */
export const updateProviderProfile = createAuthenticatedAction(
  updateProviderProfileSchema,
  async (data: UpdateProviderProfileData, user) => {
    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected',
      };
    }

    try {
      // Resolve provider profile from team ID
      const providerRepo = createProviderProfileRepository();
      const providerProfile = await providerRepo.findByTeamId(teamId);

      if (!providerProfile) {
        return {
          success: false,
          error: 'Provider profile not found',
        };
      }

      // Verify user is admin
      await requireProviderAdmin(user, providerProfile.id);

      // If slug is being updated, check for conflicts
      if (data.slug && data.slug !== providerProfile.slug) {
        const existingProfile = await providerRepo.findBySlug(data.slug);

        if (existingProfile && existingProfile.id !== providerProfile.id) {
          return {
            success: false,
            error: `A provider with slug "${data.slug}" already exists`,
          };
        }
      }

      // Update provider profile
      const updatedProfile = await providerRepo.update(providerProfile.id, {
        ...data,
        profileUrl: data.profileUrl === '' ? null : data.profileUrl,
        imageUrls: data.imageUrls,
      });

      return {
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof NotFoundError) {
        return {
          success: false,
          error: error.message,
        };
      }
      throw error;
    }
  }
);

/**
 * Get a public provider profile by slug
 * This is a public action (no authentication required)
 */
export async function getProviderBySlug(slug: string): Promise<PublicProvider | null> {
  const providerRepo = createProviderProfileRepository();
  const provider = await providerRepo.findBySlug(slug);

  if (!provider) {
    return null;
  }

  return toPublicProvider(provider);
}
