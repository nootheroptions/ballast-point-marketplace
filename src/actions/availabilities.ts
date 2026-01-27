'use server';

import { cookies } from 'next/headers';
import { createAuthenticatedAction } from '@/lib/auth/action-wrapper';
import {
  getAvailabilitySchema,
  updateWeeklyAvailabilitySchema,
  type UpdateWeeklyAvailabilityData,
} from '@/lib/validations/availability';
import { availabilityRepo } from '@/lib/repositories/availability.repo';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';

/**
 * Get the current user's availability
 */
export const getMyAvailability = createAuthenticatedAction(
  getAvailabilitySchema,
  async (data, user) => {
    const { serviceId } = data;

    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected. Please complete provider onboarding first.',
      };
    }

    try {
      // Get team member record
      const teamMemberRepo = createTeamMemberRepository();
      const teamMember = await teamMemberRepo.findByUserAndTeam(user.id, teamId);

      if (!teamMember) {
        return {
          success: false,
          error: 'Team member not found.',
        };
      }

      // Get availability for this team member
      const availability = await availabilityRepo.findByTeamMember(teamMember.id, serviceId);

      return {
        success: true,
        data: availability,
      };
    } catch (error) {
      console.error('Error fetching availability:', error);
      return {
        success: false,
        error: 'Failed to fetch availability',
      };
    }
  }
);

/**
 * Update the current user's weekly availability
 * Replaces all existing availability with the new schedule
 */
export const updateWeeklyAvailability = createAuthenticatedAction(
  updateWeeklyAvailabilitySchema,
  async (data: UpdateWeeklyAvailabilityData, user) => {
    const { availability, timezone, serviceId } = data;

    // Get team ID from cookie
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return {
        success: false,
        error: 'No team selected. Please complete provider onboarding first.',
      };
    }

    try {
      // Get team member record
      const teamMemberRepo = createTeamMemberRepository();
      const teamMember = await teamMemberRepo.findByUserAndTeam(user.id, teamId);

      if (!teamMember) {
        return {
          success: false,
          error: 'Team member not found.',
        };
      }

      // Transform the data into availability records
      const availabilityRecords = availability.flatMap((day) =>
        day.timeRanges.map((range) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: range.startTime,
          endTime: range.endTime,
          timezone: data.timezone,
          teamMemberId: teamMember.id,
          serviceId: serviceId ?? null,
        }))
      );

      // Replace all availability for this team member (transaction)
      const updatedAvailability = await availabilityRepo.replaceForTeamMember(
        teamMember.id,
        availabilityRecords,
        serviceId
      );

      return {
        success: true,
        data: updatedAvailability,
        message: 'Availability updated successfully',
      };
    } catch (error) {
      console.error('Error updating availability:', error);
      return {
        success: false,
        error: 'Failed to update availability',
      };
    }
  }
);
