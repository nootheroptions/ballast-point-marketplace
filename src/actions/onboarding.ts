'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { createProviderOnboardingProgressRepository } from '@/lib/repositories/provider-onboarding-progress.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createTeamRepository } from '@/lib/repositories/team.repo';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { createAuthenticatedAction, createAction } from '@/lib/auth/action-wrapper';
import {
  saveProgressSchema,
  completeOnboardingSchema,
  checkSlugSchema,
  type CheckSlugAvailabilityResponse,
} from '@/lib/validations/onboarding';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { createCookieOptions } from '@/lib/services/auth/cookie-options';

/**
 * Get the current user's onboarding progress
 */
export const getOnboardingProgress = createAuthenticatedAction(async (user) => {
  const onboardingProgressRepository = createProviderOnboardingProgressRepository();
  const progress = await onboardingProgressRepository.findByUserId(user.id);

  return { data: progress };
});

/**
 * Save onboarding progress without completing
 */
export const saveOnboardingProgress = createAuthenticatedAction(
  saveProgressSchema,
  async (data, user) => {
    const onboardingProgressRepository = createProviderOnboardingProgressRepository();
    await onboardingProgressRepository.upsert({
      userId: user.id,
      currentStep: data.currentStep,
      name: data.name,
      slug: data.slug,
      description: data.description,
    });

    return { message: 'Progress saved' };
  }
);

/**
 * Check if a slug is already taken
 */
export const checkSlugAvailability = createAction(checkSlugSchema, async (data) => {
  const providerProfileRepository = createProviderProfileRepository();
  const existing = await providerProfileRepository.findBySlug(data.slug);

  return { available: !existing } as CheckSlugAvailabilityResponse;
});

/**
 * Complete onboarding and create Team + ProviderProfile
 */
export const completeOnboarding = createAuthenticatedAction(
  completeOnboardingSchema,
  async (data, user) => {
    const { name, slug, description } = data;

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

    return { message: 'Onboarding completed successfully' };
  }
);
