/**
 * Authorization utilities for provider resources
 *
 * Provides helpers to check if a user is authorized to access or modify
 * resources belonging to a provider profile.
 */

import { createProviderProfileRepository } from '@/lib/repositories/provider-profile.repo';
import { createServiceRepository } from '@/lib/repositories/service.repo';
import type { AuthUser } from '@/lib/services/auth/types';
import type { TeamRole } from '@prisma/client';

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

type ProviderAccess =
  | {
      hasAccess: true;
      role: TeamRole;
      teamId: string;
    }
  | {
      hasAccess: false;
      role?: never;
      teamId?: never;
    };

/**
 * Check if a user has access to a provider profile
 *
 * @param userId - The user's ID
 * @param providerProfileId - The provider profile ID
 * @returns Object with hasAccess, role, and teamId
 */
export async function checkProviderAccess(
  userId: string,
  providerProfileId: string
): Promise<ProviderAccess> {
  const providerProfileRepo = createProviderProfileRepository();
  const providerProfile = await providerProfileRepo.findByIdWithTeamMembers(
    providerProfileId,
    userId
  );

  if (!providerProfile) {
    return { hasAccess: false };
  }

  const membership = providerProfile.team.members[0];

  if (!membership) {
    return { hasAccess: false };
  }

  return {
    hasAccess: true,
    role: membership.role as TeamRole,
    teamId: providerProfile.teamId,
  };
}

/**
 * Require that a user has access to a provider profile
 *
 * @param user - The authenticated user
 * @param providerProfileId - The provider profile ID
 * @throws {NotFoundError} When provider profile is not found
 * @throws {ForbiddenError} When user doesn't have access
 * @returns The user's access information
 */
export async function requireProviderAccess(
  user: AuthUser,
  providerProfileId: string
): Promise<ProviderAccess> {
  const providerProfileRepo = createProviderProfileRepository();
  const providerProfile = await providerProfileRepo.findById(providerProfileId);

  if (!providerProfile) {
    throw new NotFoundError('Provider profile not found');
  }

  const access = await checkProviderAccess(user.id, providerProfileId);

  if (!access.hasAccess) {
    throw new ForbiddenError('You do not have access to this provider');
  }

  return access;
}

/**
 * Require that a user has admin access to a provider profile
 *
 * @param user - The authenticated user
 * @param providerProfileId - The provider profile ID
 * @throws {NotFoundError} When provider profile is not found
 * @throws {ForbiddenError} When user doesn't have admin access
 * @returns The user's access information
 */
export async function requireProviderAdmin(
  user: AuthUser,
  providerProfileId: string
): Promise<ProviderAccess> {
  const access = await requireProviderAccess(user, providerProfileId);

  if (access.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required for this action');
  }

  return access;
}

/**
 * Get provider profile ID from a service ID
 *
 * @param serviceId - The service ID
 * @returns The provider profile ID or null if service not found
 */
export async function getProviderIdFromService(serviceId: string): Promise<string | null> {
  const serviceRepo = createServiceRepository();
  const service = await serviceRepo.findById(serviceId);

  return service?.providerProfileId ?? null;
}
