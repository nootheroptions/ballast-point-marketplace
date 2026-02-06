/**
 * Provider licensing validation schemas
 */

import { z } from 'zod';
import { VALID_AU_JURISDICTIONS } from '@/lib/locations';
import { countryCodeEnum } from '@/lib/validations/provider-country';

/**
 * Schema for updating provider licenses (jurisdictions)
 */
export const updateLicensesSchema = z.object({
  country: countryCodeEnum,
  jurisdictions: z
    .array(z.string().min(1))
    .min(1, 'At least one licensed jurisdiction is required')
    .refine(
      (jurisdictions) => {
        // For now, only validate AU jurisdictions
        return jurisdictions.every((j) => VALID_AU_JURISDICTIONS.includes(j));
      },
      { message: 'Invalid jurisdiction code' }
    ),
});

export type UpdateLicensesData = z.infer<typeof updateLicensesSchema>;
