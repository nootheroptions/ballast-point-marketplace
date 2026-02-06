'use server';

import { cookies } from 'next/headers';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  createBundleSchema,
  getBundleByIdSchema,
  updateBundleWithIdSchema,
  deleteBundleSchema,
  publishBundleSchema,
  type CreateBundleData,
  type PublishBundleData,
} from '@/lib/validations/bundle';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createBundleRepository } from '@/lib/repositories/bundle.repo';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import {
  requireProviderAdmin,
  ForbiddenError,
  NotFoundError,
  requireProviderAccess,
} from '@/lib/auth/provider-authorization';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { TEMPLATE_STAGE_ORDER } from '@/lib/marketplace/templates';
import { TemplateKey, BundlePricingType } from '@prisma/client';

/**
 * Helper to validate that bundle services follow template stage order
 * and that at most one service per template is included.
 * If services are in the wrong order, returns them in the correct order.
 */
async function _validateBundleServices(
  serviceIds: string[],
  providerProfileId: string
): Promise<{
  valid: boolean;
  error?: string;
  templateKeys?: TemplateKey[];
  orderedServiceIds?: string[];
}> {
  const serviceRepo = createServiceRepository();

  // Fetch all services and verify they belong to this provider
  const services = await Promise.all(serviceIds.map((id) => serviceRepo.findById(id)));

  // Check all services exist and belong to this provider
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    if (!service) {
      return { valid: false, error: `Service not found: ${serviceIds[i]}` };
    }
    if (service.providerProfileId !== providerProfileId) {
      return { valid: false, error: 'All services must belong to your provider profile' };
    }
  }

  // Get template keys and check for duplicates
  const templateKeys = services.map((s) => s!.templateKey);
  const uniqueTemplates = new Set(templateKeys);
  if (uniqueTemplates.size !== templateKeys.length) {
    return {
      valid: false,
      error: 'Bundle cannot include multiple services of the same template type',
    };
  }

  // Sort services by template stage order
  const sortedServices = [...services].sort((a, b) => {
    const aIndex = TEMPLATE_STAGE_ORDER.indexOf(a!.templateKey);
    const bIndex = TEMPLATE_STAGE_ORDER.indexOf(b!.templateKey);
    return aIndex - bIndex;
  });

  const orderedServiceIds = sortedServices.map((s) => s!.id);
  const orderedTemplateKeys = sortedServices.map((s) => s!.templateKey);

  return { valid: true, templateKeys: orderedTemplateKeys, orderedServiceIds };
}

/**
 * Get bundles for the current team's provider profile
 */
export const getBundles = createAuthenticatedAction(async (user) => {
  // Get team ID from cookie
  const cookieStore = await cookies();
  const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

  if (!teamId) {
    return {
      success: false,
      error: 'No team selected. Please complete provider onboarding first.',
    };
  }

  // Resolve provider profile from team ID
  const providerRepo = createProviderProfileRepository();
  const providerProfile = await providerRepo.findByTeamId(teamId);

  if (!providerProfile) {
    return {
      success: false,
      error: 'Provider profile not found. Please complete provider onboarding first.',
    };
  }

  try {
    // Verify user is actually a member of this team
    await requireProviderAccess(user, providerProfile.id);

    // Get bundles for this provider
    const bundleRepo = createBundleRepository();
    const bundles = await bundleRepo.findByProviderProfileId(providerProfile.id);

    // Calculate actual prices for SUM_OF_PARTS bundles
    const bundlesWithPrices = await Promise.all(
      bundles.map(async (bundle) => {
        if (bundle.pricingType === BundlePricingType.SUM_OF_PARTS) {
          const calculatedPrice = await bundleRepo.calculateSumOfPartsPriceCents(bundle.id);
          return { ...bundle, calculatedPriceCents: calculatedPrice };
        }
        return { ...bundle, calculatedPriceCents: bundle.priceCents };
      })
    );

    return bundlesWithPrices;
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
 * Get a single bundle by ID
 */
export const getBundleById = createAuthenticatedAction(getBundleByIdSchema, async (data, user) => {
  const { id } = data;

  try {
    const bundleRepo = createBundleRepository();
    const bundle = await bundleRepo.findByIdWithServices(id);

    if (!bundle) {
      return {
        success: false,
        error: 'Bundle not found',
      };
    }

    // Verify user has access to this provider
    await requireProviderAdmin(user, bundle.providerProfileId);

    // Calculate price for SUM_OF_PARTS bundles
    if (bundle.pricingType === BundlePricingType.SUM_OF_PARTS) {
      const calculatedPrice = await bundleRepo.calculateSumOfPartsPriceCents(bundle.id);
      return { ...bundle, calculatedPriceCents: calculatedPrice };
    }

    return { ...bundle, calculatedPriceCents: bundle.priceCents };
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
 * Create a new bundle
 */
export const createBundle = createAuthenticatedAction(
  createBundleSchema,
  async (data: CreateBundleData, user) => {
    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected',
      };
    }

    // Resolve provider profile from team ID
    const providerRepo = createProviderProfileRepository();
    const providerProfile = await providerRepo.findByTeamId(teamId);

    if (!providerProfile) {
      return {
        success: false,
        error: 'Provider profile not found',
      };
    }

    try {
      // Verify user is admin
      await requireProviderAdmin(user, providerProfile.id);

      // Check if slug already exists for this provider
      const bundleRepo = createBundleRepository();
      const existingBundle = await bundleRepo.findByProviderAndSlug(providerProfile.id, data.slug);

      if (existingBundle) {
        return {
          success: false,
          error: `A bundle with slug "${data.slug}" already exists for this provider`,
        };
      }

      // Validate services and get correctly ordered service IDs
      const serviceIds = data.services.map((s) => s.serviceId);
      const validation = await _validateBundleServices(serviceIds, providerProfile.id);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Reorder services to match template stage order
      const orderedServices = validation.orderedServiceIds!.map((serviceId, index) => ({
        serviceId,
        sortOrder: index,
      }));

      // For SUM_OF_PARTS, we don't store a price (it's calculated on the fly)
      // For FIXED, we use the provided price
      const priceCents = data.pricingType === BundlePricingType.SUM_OF_PARTS ? 0 : data.priceCents;

      // Create bundle
      const bundle = await bundleRepo.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        providerProfileId: providerProfile.id,
        pricingType: data.pricingType,
        priceCents,
        positioning: data.positioning,
        services: orderedServices,
      });

      return {
        success: true,
        data: bundle,
        message: 'Bundle created successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenError) {
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
 * Update a bundle
 */
export const updateBundle = createAuthenticatedAction(
  updateBundleWithIdSchema,
  async (data, user) => {
    const { id, slug, services, ...updateData } = data;

    try {
      const bundleRepo = createBundleRepository();
      const bundle = await bundleRepo.findById(id);

      if (!bundle) {
        return {
          success: false,
          error: 'Bundle not found',
        };
      }

      // Verify user is admin of the provider
      await requireProviderAdmin(user, bundle.providerProfileId);

      // If slug is being updated, check for conflicts
      if (slug !== undefined) {
        const existingBundle = await bundleRepo.findByProviderAndSlug(
          bundle.providerProfileId,
          slug
        );

        if (existingBundle && existingBundle.id !== id) {
          return {
            success: false,
            error: `A bundle with slug "${slug}" already exists for this provider`,
          };
        }
      }

      // If services are being updated, validate them and reorder
      let orderedServices: { serviceId: string; sortOrder: number }[] | undefined;
      if (services) {
        const serviceIds = services.map((s) => s.serviceId);
        const validation = await _validateBundleServices(serviceIds, bundle.providerProfileId);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error,
          };
        }
        // Reorder services to match template stage order
        orderedServices = validation.orderedServiceIds!.map((serviceId, index) => ({
          serviceId,
          sortOrder: index,
        }));
      }

      // Update bundle
      const updatedBundle = await bundleRepo.update(id, {
        ...(slug !== undefined && { slug }),
        ...(orderedServices && { services: orderedServices }),
        ...updateData,
      });

      return {
        success: true,
        data: updatedBundle,
        message: 'Bundle updated successfully',
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
 * Delete a bundle
 */
export const deleteBundle = createAuthenticatedAction(deleteBundleSchema, async (data, user) => {
  const { id } = data;

  try {
    const bundleRepo = createBundleRepository();
    const bundle = await bundleRepo.findById(id);

    if (!bundle) {
      return {
        success: false,
        error: 'Bundle not found',
      };
    }

    // Verify user is admin of the provider
    await requireProviderAdmin(user, bundle.providerProfileId);

    // Delete bundle
    await bundleRepo.delete(id);

    return {
      success: true,
      message: 'Bundle deleted successfully',
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
 * Publish or unpublish a bundle
 */
export const publishBundle = createAuthenticatedAction(
  publishBundleSchema,
  async (data: PublishBundleData, user) => {
    const { id, isPublished } = data;

    try {
      const bundleRepo = createBundleRepository();
      const bundle = await bundleRepo.findByIdWithServices(id);

      if (!bundle) {
        return {
          success: false,
          error: 'Bundle not found',
        };
      }

      // Verify user is admin of the provider
      await requireProviderAdmin(user, bundle.providerProfileId);

      // If publishing, ensure bundle has at least 2 services
      if (isPublished && bundle.services.length < 2) {
        return {
          success: false,
          error: 'Cannot publish a bundle with fewer than 2 services',
        };
      }

      // Update publish status
      const updatedBundle = await bundleRepo.update(id, { isPublished });

      return {
        success: true,
        data: updatedBundle,
        message: isPublished ? 'Bundle published successfully' : 'Bundle unpublished successfully',
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
