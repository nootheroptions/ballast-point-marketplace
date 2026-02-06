import { z } from 'zod';
import { isValidAuJurisdiction, AU_LOCALITIES } from '@/lib/locations';
import { countryCodeEnum } from '@/lib/validations/provider-country';

/**
 * Schema for a single service area entry
 */
export const serviceAreaEntrySchema = z.object({
  country: countryCodeEnum,
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  localityName: z.string().min(1, 'Locality name is required'),
  localityType: z.string().optional(),
});

export type ServiceAreaEntry = z.infer<typeof serviceAreaEntrySchema>;

/**
 * Schema for updating provider service areas
 */
export const updateServiceAreasSchema = z.object({
  serviceAreas: z
    .array(serviceAreaEntrySchema)
    .min(1, 'At least one service area is required')
    .refine(
      (areas) => {
        // For now, only validate AU
        return areas.every((a) => {
          if (a.country !== 'AU' || !isValidAuJurisdiction(a.jurisdiction)) {
            return false;
          }
          // Check if locality exists in the jurisdiction's locality list
          const validLocalities = AU_LOCALITIES[a.jurisdiction as keyof typeof AU_LOCALITIES] || [];
          return validLocalities.includes(a.localityName);
        });
      },
      { message: 'Invalid service area configuration' }
    ),
});

export type UpdateServiceAreasData = z.infer<typeof updateServiceAreasSchema>;
