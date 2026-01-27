import type { Prisma, TeamMember } from '@prisma/client';
import {
  createTeamMemberRepository,
  type CreateTeamMemberData,
} from '@/lib/repositories/team-member.repo';
import {
  availabilityRepo,
  type AvailabilityCreateInput,
} from '@/lib/repositories/availability.repo';
import type { TeamMemberService, CreateTeamMemberWithDefaultsOptions } from './types';

/**
 * Default availability: Monday-Friday 9am-5pm
 */
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri (Sunday=0, Monday=1, etc.)
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '17:00';
const DEFAULT_TIMEZONE = 'UTC';

/**
 * Creates a team member service implementation
 * @returns TeamMemberService implementation
 */
export function createTeamMemberService(): TeamMemberService {
  const teamMemberRepository = createTeamMemberRepository();

  return {
    async createWithDefaults(
      data: CreateTeamMemberData,
      options: CreateTeamMemberWithDefaultsOptions = {},
      tx?: Prisma.TransactionClient
    ): Promise<TeamMember> {
      const { timezone = DEFAULT_TIMEZONE, createDefaultAvailability = true } = options;

      // Create the team member
      const teamMember = await teamMemberRepository.create(data, tx);

      // Create default availability if enabled
      if (createDefaultAvailability) {
        const defaultAvailability: AvailabilityCreateInput[] = DEFAULT_WORK_DAYS.map(
          (dayOfWeek) => ({
            dayOfWeek,
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            timezone,
            teamMemberId: teamMember.id,
            serviceId: null, // General availability, not service-specific
          })
        );

        await availabilityRepo.createMany(defaultAvailability, tx);
      }

      return teamMember;
    },
  };
}
