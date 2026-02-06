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
  updateServiceAreasSchema,
  type UpdateServiceAreasData,
} from '@/lib/validations/provider-service-areas';
import { cookies } from 'next/headers';

/**
 * Get the current provider's service areas
 */
export const getProviderServiceAreas = createAuthenticatedAction(async (user) => {
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

    const serviceAreasRepo = createProviderServiceAreasRepository();

    const serviceAreas = await serviceAreasRepo.getServiceAreas(providerProfile.id);

    return {
      success: true,
      data: { serviceAreas },
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
 * Update provider service areas
 * Service areas must be within licensed jurisdictions
 */
export const updateProviderServiceAreas = createAuthenticatedAction(
  updateServiceAreasSchema,
  async (data: UpdateServiceAreasData, user) => {
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

      // Validate that all service areas are within licensed jurisdictions
      const licenses = await licensingRepo.getLicenses(providerProfile.id);
      const licensedJurisdictions = new Set(licenses.map((l) => `${l.country}-${l.jurisdiction}`));

      const invalidAreas = data.serviceAreas.filter(
        (area) => !licensedJurisdictions.has(`${area.country}-${area.jurisdiction}`)
      );
      if (invalidAreas.length > 0) {
        const invalidJurisdictions = [...new Set(invalidAreas.map((a) => a.jurisdiction))].join(
          ', '
        );
        return {
          success: false,
          error: `Cannot add service areas for unlicensed jurisdictions: ${invalidJurisdictions}. Please add these to your licensing first.`,
        };
      }

      const serviceAreas = await prisma.$transaction((tx) =>
        serviceAreasRepo.replaceServiceAreas(
          providerProfile.id,
          data.serviceAreas.map((a) => ({
            country: a.country as SupportedCountryCodes,
            jurisdiction: a.jurisdiction,
            localityName: a.localityName,
            localityType: a.localityType,
          })),
          tx
        )
      );

      return {
        success: true,
        data: serviceAreas,
        message: 'Service areas updated successfully',
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
