'use server';

import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  requireProviderAdmin,
  ForbiddenError,
  NotFoundError,
} from '@/lib/auth/provider-authorization';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { prisma } from '@/lib/db/prisma';
import { SupportedCountryCodes } from '@/lib/locations';
import { createProviderLicensingRepository } from '@/lib/repositories/provider-licensing.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import {
  updateLocalExperienceSchema,
  UpdateLocalExperienceData,
} from '@/lib/validations/provider-location-experience';
import { cookies } from 'next/headers';

/**
 * Get the current provider's local experience
 */
export const getProviderLocalExperience = createAuthenticatedAction(async (user) => {
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected. Please complete provider onboarding first.',
    };
  }

  try {
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found. Please complete provider onboarding first.',
      };
    }

    await requireProviderAdmin(user, providerProfile.id);

    const licensingRepo = createProviderLicensingRepository();
    const localExperience = await licensingRepo.getLocalExperience(providerProfile.id);

    return {
      success: true,
      data: { localExperience },
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
});

/**
 * Update provider local experience
 * Localities must be within licensed jurisdictions
 */
export const updateProviderLocalExperience = createAuthenticatedAction(
  updateLocalExperienceSchema,
  async (data: UpdateLocalExperienceData, user) => {
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected',
      };
    }

    try {
      const providerRepo = createProviderProfileRepository();
      const providerProfile = await providerRepo.findByTeamId(teamId);

      if (!providerProfile) {
        return {
          success: false,
          error: 'Provider profile not found',
        };
      }

      await requireProviderAdmin(user, providerProfile.id);

      const licensingRepo = createProviderLicensingRepository();

      // Validate that all localities are within licensed jurisdictions
      const licenses = await licensingRepo.getLicenses(providerProfile.id);
      const licensedJurisdictions = new Set(licenses.map((l) => `${l.country}-${l.jurisdiction}`));

      const invalidLocalities = data.localities.filter(
        (loc) => !licensedJurisdictions.has(`${loc.country}-${loc.jurisdiction}`)
      );
      if (invalidLocalities.length > 0) {
        const invalidJurisdictions = [
          ...new Set(invalidLocalities.map((l) => l.jurisdiction)),
        ].join(', ');
        return {
          success: false,
          error: `Cannot add localities for unlicensed jurisdictions: ${invalidJurisdictions}. Please add these to your licensing first.`,
        };
      }

      // Update local experience
      const localities = await prisma.$transaction((tx) =>
        licensingRepo.replaceLocalExperience(
          providerProfile.id,
          data.localities.map((l) => ({
            country: l.country as SupportedCountryCodes,
            jurisdiction: l.jurisdiction,
            localityName: l.localityName,
            localityType: l.localityType,
          })),
          tx
        )
      );

      return {
        success: true,
        data: localities,
        message: 'Local experience updated successfully',
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
