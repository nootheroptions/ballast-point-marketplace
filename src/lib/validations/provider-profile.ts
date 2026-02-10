/**
 * Provider profile validation schemas
 */

import { z } from 'zod';

// Slug validation: lowercase letters, numbers, and hyphens only
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Schema for updating provider profile basic information
 */
export const updateProviderProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'URL slug is required')
    .max(50, 'URL slug must be less than 50 characters')
    .regex(slugRegex, 'URL slug can only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(600, 'Description must be less than 600 characters')
    .optional()
    .nullable(),
  imageUrls: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed'),
});

export type UpdateProviderProfileData = z.infer<typeof updateProviderProfileSchema>;
