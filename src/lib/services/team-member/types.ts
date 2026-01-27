import type { TeamMember, Prisma } from '@prisma/client';
import type { CreateTeamMemberData } from '@/lib/repositories/team-member.repo';

/**
 * Options for creating a team member with defaults
 */
export interface CreateTeamMemberWithDefaultsOptions {
  /**
   * Timezone for default availability
   * Defaults to UTC if not provided
   */
  timezone?: string;

  /**
   * Whether to create default availability (Mon-Fri 9-5)
   * Defaults to true
   */
  createDefaultAvailability?: boolean;
}

/**
 * Team member service abstraction layer
 * Encapsulates business logic for team member operations
 */
export interface TeamMemberService {
  /**
   * Create a team member with default availability
   *
   * Creates a team member along with their default availability schedule
   * (Monday-Friday 9am-5pm by default).
   *
   * @param data - Team member creation data
   * @param options - Configuration options
   * @param tx - Optional Prisma transaction client
   * @returns The created team member
   */
  createWithDefaults(
    data: CreateTeamMemberData,
    options?: CreateTeamMemberWithDefaultsOptions,
    tx?: Prisma.TransactionClient
  ): Promise<TeamMember>;
}

export type TeamMemberServiceFactory = () => TeamMemberService;
