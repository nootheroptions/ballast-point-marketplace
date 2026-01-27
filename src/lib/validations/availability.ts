import { z } from 'zod';
import { isValidTimeString, isValidTimezone } from '@/lib/utils/timezone';

/**
 * Schema for a single time range within a day
 */
export const timeRangeSchema = z
  .object({
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format')
      .refine((time) => isValidTimeString(time), 'Invalid time format'),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format')
      .refine((time) => isValidTimeString(time), 'Invalid time format'),
  })
  .refine(
    (data) => {
      // Ensure end time is after start time
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = (startHour ?? 0) * 60 + (startMin ?? 0);
      const endMinutes = (endHour ?? 0) * 60 + (endMin ?? 0);
      return endMinutes > startMinutes;
    },
    { message: 'End time must be after start time' }
  );

export type TimeRange = z.infer<typeof timeRangeSchema>;

/**
 * Schema for a single day's availability
 */
export const dayAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  timeRanges: z.array(timeRangeSchema).min(1, 'At least one time range is required'),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
});

export type DayAvailability = z.infer<typeof dayAvailabilitySchema>;

/**
 * Schema for updating weekly availability
 * Maps day of week (0-6) to time ranges
 */
export const updateWeeklyAvailabilitySchema = z.object({
  availability: z.array(dayAvailabilitySchema),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine((tz) => isValidTimezone(tz), 'Invalid IANA timezone'),
  serviceId: z.string().uuid().optional().nullable(),
});

export type UpdateWeeklyAvailabilityData = z.infer<typeof updateWeeklyAvailabilitySchema>;

/**
 * Schema for getting availability
 */
export const getAvailabilitySchema = z.object({
  serviceId: z.string().uuid().optional().nullable(),
});

export type GetAvailabilityData = z.infer<typeof getAvailabilitySchema>;
