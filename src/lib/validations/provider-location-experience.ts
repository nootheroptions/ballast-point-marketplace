import z from 'zod';
import { countryCodeEnum } from './provider-country';

/**
 * Schema for a single local experience entry
 */
export const localExperienceEntrySchema = z.object({
  country: countryCodeEnum,
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  localityName: z.string().min(1, 'Locality name is required'),
  localityType: z.string().optional(),
});

export type LocalExperienceEntry = z.infer<typeof localExperienceEntrySchema>;

/**
 * Schema for updating provider local experience
 */
export const updateLocalExperienceSchema = z.object({
  localities: z.array(localExperienceEntrySchema),
});

export type UpdateLocalExperienceData = z.infer<typeof updateLocalExperienceSchema>;
