'use server';

import { cookies } from 'next/headers';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  createServiceSchema,
  getServiceByIdSchema,
  updateServiceWithIdSchema,
  deleteServiceSchema,
  publishServiceSchema,
  type CreateServiceData,
  type PublishServiceData,
} from '@/lib/validations/service';
import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import {
  requireProviderAdmin,
  getProviderIdFromService,
  ForbiddenError,
  NotFoundError,
  requireProviderAccess,
} from '@/lib/auth/provider-authorization';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';

/**
 * Search for published services in the marketplace
 * This is a public action (no authentication required)
 */
export async function searchServices() {
  const serviceRepo = createServiceRepository();
  const services = await serviceRepo.findPublishedServices();
  return services;
}

/**
 * Get a published service by provider slug and service slug
 * This is a public action (no authentication required)
 */
export async function getServiceBySlug(providerSlug: string, serviceSlug: string) {
  const serviceRepo = createServiceRepository();
  const service = await serviceRepo.findPublishedBySlug(providerSlug, serviceSlug);
  return service;
}

/**
 * Get services for the current team's provider profile
 */
export const getServices = createAuthenticatedAction(async (user) => {
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

    // Get services for this provider
    const serviceRepo = createServiceRepository();
    const services = await serviceRepo.findByProviderProfileId(providerProfile.id);

    return services;
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
 * Get a single service by ID
 */
export const getServiceById = createAuthenticatedAction(
  getServiceByIdSchema,
  async (data, user) => {
    const { id } = data;

    try {
      // Get service
      const serviceRepo = createServiceRepository();
      const service = await serviceRepo.findById(id);

      if (!service) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      // Verify user has access to this provider
      await requireProviderAdmin(user, service.providerProfileId);

      return service;
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
 * Create a new service
 */
export const createService = createAuthenticatedAction(
  createServiceSchema,
  async (data: CreateServiceData, user) => {
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
      const serviceRepo = createServiceRepository();
      const existingService = await serviceRepo.findByProviderAndSlug(
        providerProfile.id,
        data.slug
      );

      if (existingService) {
        return {
          success: false,
          error: `A service with slug "${data.slug}" already exists for this provider`,
        };
      }

      // Create service (handles both booking and marketplace services)
      const service = await serviceRepo.create({
        ...data,
        providerProfileId: providerProfile.id,
      });

      return {
        success: true,
        data: service,
        message: 'Service created successfully',
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
 * Update a service
 */
export const updateService = createAuthenticatedAction(
  updateServiceWithIdSchema,
  async (data, user) => {
    const { id, slug, ...updateData } = data;

    try {
      // Get service to find its provider ID
      const providerId = await getProviderIdFromService(id);

      if (!providerId) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      // Verify user is admin of the provider
      await requireProviderAdmin(user, providerId);

      // If slug is being updated, check for conflicts
      const serviceRepo = createServiceRepository();
      if (slug !== undefined) {
        const existingService = await serviceRepo.findByProviderAndSlug(providerId, slug);

        // Check if a different service with this slug exists
        if (existingService && existingService.id !== id) {
          return {
            success: false,
            error: `A service with slug "${slug}" already exists for this provider`,
          };
        }
      }

      // Update service with all provided fields
      const service = await serviceRepo.update(id, {
        ...(slug !== undefined && { slug }),
        ...updateData,
      });

      return {
        success: true,
        data: service,
        message: 'Service updated successfully',
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
 * Delete a service
 */
export const deleteService = createAuthenticatedAction(deleteServiceSchema, async (data, user) => {
  const { id } = data;

  try {
    // Get service to find its provider ID
    const providerId = await getProviderIdFromService(id);

    if (!providerId) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Verify user is admin of the provider
    await requireProviderAdmin(user, providerId);

    // Delete service
    const serviceRepo = createServiceRepository();
    await serviceRepo.delete(id);

    return {
      success: true,
      message: 'Service deleted successfully',
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
 * Publish or unpublish a service
 */
export const publishService = createAuthenticatedAction(
  publishServiceSchema,
  async (data: PublishServiceData, user) => {
    const { id, isPublished } = data;

    try {
      // Get service to find its provider ID
      const providerId = await getProviderIdFromService(id);

      if (!providerId) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      // Verify user is admin of the provider
      await requireProviderAdmin(user, providerId);

      // Update publish status
      const serviceRepo = createServiceRepository();
      const service = await serviceRepo.update(id, { isPublished });

      return {
        success: true,
        data: service,
        message: isPublished
          ? 'Service published successfully'
          : 'Service unpublished successfully',
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
