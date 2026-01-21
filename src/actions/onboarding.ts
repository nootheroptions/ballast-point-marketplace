'use server';

import { cookies } from 'next/headers';
import { ActionResult } from '@/actions/types';
import { prisma } from '@/lib/db/prisma';
import { createProviderOnboardingProgressRepository } from '@/lib/repositories/provider-onboarding-progress.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createTeamRepository } from '@/lib/repositories/team.repo';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { createAuthService } from '@/lib/services/auth';
import {
  saveProgressSchema,
  completeOnboardingSchema,
  type SaveProgressRequest,
  type CompleteOnboardingRequest,
  type OnboardingProgressResponse,
  type CheckSlugAvailabilityResponse,
} from '@/lib/validations/onboarding';
import { env } from '@/lib/config/env';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { createCookieOptions } from '@/lib/services/auth/cookie-options';

/**
 * Get the current user's onboarding progress
 */
export async function getOnboardingProgress(): Promise<
  ActionResult<OnboardingProgressResponse | null>
> {
  try {
    const authService = await createAuthService();
    const { data: user, error } = await authService.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'You must be logged in to access onboarding',
      };
    }

    const onboardingProgressRepository = createProviderOnboardingProgressRepository();
    const progress = await onboardingProgressRepository.findByUserId(user.id);

    return {
      success: true,
      data: progress,
    };
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    return {
      success: false,
      error: 'Failed to get onboarding progress',
    };
  }
}

/**
 * Save onboarding progress without completing
 */
export async function saveOnboardingProgress(data: SaveProgressRequest): Promise<ActionResult> {
  try {
    const authService = await createAuthService();
    const { data: user, error } = await authService.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'You must be logged in to save progress',
      };
    }

    const validatedData = saveProgressSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message ?? 'Invalid data',
      };
    }

    const onboardingProgressRepository = createProviderOnboardingProgressRepository();
    await onboardingProgressRepository.upsert({
      userId: user.id,
      currentStep: validatedData.data.currentStep,
      name: validatedData.data.name,
      slug: validatedData.data.slug,
      description: validatedData.data.description,
    });

    return {
      success: true,
      message: 'Progress saved',
    };
  } catch (error) {
    console.error('Save onboarding progress error:', error);
    return {
      success: false,
      error: 'Failed to save progress',
    };
  }
}

/**
 * Check if a slug is already taken
 */
export async function checkSlugAvailability(
  slug: string
): Promise<ActionResult<CheckSlugAvailabilityResponse>> {
  try {
    const providerProfileRepository = createProviderProfileRepository();
    const existing = await providerProfileRepository.findBySlug(slug);

    return {
      success: true,
      data: { available: !existing },
    };
  } catch (error) {
    console.error('Check slug availability error:', error);
    return {
      success: false,
      error: 'Failed to check slug availability',
    };
  }
}

/**
 * Complete onboarding and create Team + ProviderProfile
 */
export async function completeOnboarding(data: CompleteOnboardingRequest): Promise<ActionResult> {
  try {
    const authService = await createAuthService();
    const { data: user, error } = await authService.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'You must be logged in to complete onboarding',
      };
    }

    const validatedData = completeOnboardingSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message ?? 'Invalid data',
      };
    }

    const { name, slug, description } = validatedData.data;

    // Check if slug is already taken
    const providerProfileRepository = createProviderProfileRepository();
    const existingProfile = await providerProfileRepository.findBySlug(slug);

    if (existingProfile) {
      return {
        success: false,
        error: 'This URL slug is already taken. Please choose a different one.',
      };
    }

    // Create repositories
    const teamRepository = createTeamRepository();
    const teamMemberRepository = createTeamMemberRepository();
    const onboardingProgressRepository = createProviderOnboardingProgressRepository();

    // Create Team, TeamMember, and ProviderProfile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create team
      const team = await teamRepository.create(tx);

      // Add user as admin
      await teamMemberRepository.create(
        {
          userId: user.id,
          teamId: team.id,
          role: 'ADMIN',
        },
        tx
      );

      // Create provider profile
      await providerProfileRepository.create(
        {
          teamId: team.id,
          name,
          slug,
          description,
        },
        tx
      );

      // Delete onboarding progress
      await onboardingProgressRepository.deleteByUserId(user.id, tx);

      return team;
    });

    // Set current team cookie
    const cookieStore = await cookies();
    cookieStore.set(CURRENT_TEAM_COOKIE, result.id, createCookieOptions());

    return {
      success: true,
      message: 'Onboarding completed successfully',
    };
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return {
      success: false,
      error: 'Failed to complete onboarding',
    };
  }
}
