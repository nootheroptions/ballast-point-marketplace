'use server';

import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  ForbiddenError,
  NotFoundError,
  requireProviderAdmin,
} from '@/lib/auth/provider-authorization';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { prisma } from '@/lib/db/prisma';
import type { SupportedCountryCodes } from '@/lib/locations';
import { createProviderLicensingRepository } from '@/lib/repositories/provider-licensing.repo';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createProviderServiceAreasRepository } from '@/lib/repositories/provider-service-areas.repo';
import {
  updateLicensesSchema,
  type UpdateLicensesData,
} from '@/lib/validations/provider-licensing';
import { cookies } from 'next/headers';

/**
 * Get the current provider's licensing data (licenses)
 */
export const getProviderLicensing = createAuthenticatedAction(async (user) => {
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
    const licenses = await licensingRepo.getLicenses(providerProfile.id);

    return {
      success: true,
      data: { licenses },
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
 * Update provider licenses (jurisdictions)
 * This will also clean up service areas and deactivate local experience for removed jurisdictions
 */
export const updateProviderLicenses = createAuthenticatedAction(
  updateLicensesSchema,
  async (data: UpdateLicensesData, user) => {
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
      const serviceAreasRepo = createProviderServiceAreasRepository();
      const country = data.country as SupportedCountryCodes;

      // Use a transaction to ensure consistency
      const result = await prisma.$transaction(async (tx) => {
        // Get current licenses for this country
        const currentLicenses = await licensingRepo.getLicenses(providerProfile.id, tx);
        const currentJurisdictions = new Set(
          currentLicenses.filter((l) => l.country === country).map((l) => l.jurisdiction)
        );
        const newJurisdictions = new Set(data.jurisdictions);

        // Find jurisdictions being removed
        const removedJurisdictions = [...currentJurisdictions].filter(
          (j) => !newJurisdictions.has(j)
        );

        // Delete service areas and deactivate local experience for removed jurisdictions
        if (removedJurisdictions.length > 0) {
          await serviceAreasRepo.deleteServiceAreasForJurisdictions(
            providerProfile.id,
            country,
            removedJurisdictions,
            tx
          );
          await licensingRepo.deactivateLocalExperienceForJurisdictions(
            providerProfile.id,
            country,
            removedJurisdictions,
            tx
          );
        }

        // Update licenses
        const licenses = await licensingRepo.replaceLicenses(
          providerProfile.id,
          country,
          data.jurisdictions,
          tx
        );

        return licenses;
      });

      return {
        success: true,
        data: result,
        message: 'Licenses updated successfully',
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
