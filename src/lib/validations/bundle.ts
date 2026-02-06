import { BundlePricingType } from '@prisma/client';
import { z } from 'zod';

/**
 * Regex pattern for valid slugs: lowercase letters, numbers, and hyphens
 * Must start and end with alphanumeric character
 */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Schema for a service selection in a bundle
 */
const bundleServiceSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  sortOrder: z.number().int().min(0),
});

/**
 * Schema for creating a bundle
 */
export const createBundleSchema = z
  .object({
    name: z.string().min(1, 'Bundle name is required').max(255, 'Name is too long'),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .max(100, 'Slug is too long')
      .regex(slugPattern, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z
      .string()
      .min(1, 'Bundle description is required')
      .max(2000, 'Description is too long'),
    positioning: z.string().max(200).optional(),
    pricingType: z.nativeEnum(BundlePricingType, { message: 'Pricing type is required' }),
    // Only used when pricingType is FIXED
    priceCents: z
      .number()
      .int()
      .min(0, 'Price must be non-negative')
      .max(10000000, 'Price too high'),
    // Services to include in the bundle (at least 2)
    services: z.array(bundleServiceSchema).min(2, 'Bundle must include at least 2 services'),
  })
  .superRefine((data, ctx) => {
    // If pricing type is FIXED, price must be greater than 0
    if (data.pricingType === BundlePricingType.FIXED && data.priceCents <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed price must be greater than 0',
        path: ['priceCents'],
      });
    }

    // Check for duplicate services
    const serviceIds = data.services.map((s) => s.serviceId);
    const uniqueIds = new Set(serviceIds);
    if (uniqueIds.size !== serviceIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bundle cannot include the same service multiple times',
        path: ['services'],
      });
    }
  });

export type CreateBundleData = z.infer<typeof createBundleSchema>;

/**
 * Schema for updating a bundle
 */
export const updateBundleSchema = z.object({
  name: z.string().min(1, 'Bundle name is required').max(255, 'Name is too long').optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug is too long')
    .regex(slugPattern, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z
    .string()
    .min(1, 'Bundle description is required')
    .max(2000, 'Description is too long')
    .optional(),
  positioning: z.string().max(200).optional().nullable(),
  pricingType: z.nativeEnum(BundlePricingType).optional(),
  priceCents: z.number().int().min(0).max(10000000).optional(),
  isPublished: z.boolean().optional(),
  // If services provided, will replace all existing bundle services
  services: z
    .array(bundleServiceSchema)
    .min(2, 'Bundle must include at least 2 services')
    .optional(),
});

export type UpdateBundleData = z.infer<typeof updateBundleSchema>;

/**
 * Schema for getting a bundle by ID
 */
export const getBundleByIdSchema = z.object({
  id: z.string().min(1, 'Bundle ID is required'),
});

export type GetBundleByIdData = z.infer<typeof getBundleByIdSchema>;

/**
 * Schema for updating a bundle with ID
 */
export const updateBundleWithIdSchema = updateBundleSchema.extend({
  id: z.string().min(1, 'Bundle ID is required'),
});

export type UpdateBundleWithIdData = z.infer<typeof updateBundleWithIdSchema>;

/**
 * Schema for deleting a bundle
 */
export const deleteBundleSchema = z.object({
  id: z.string().min(1, 'Bundle ID is required'),
});

export type DeleteBundleData = z.infer<typeof deleteBundleSchema>;

/**
 * Schema for publishing/unpublishing a bundle
 */
export const publishBundleSchema = z.object({
  id: z.string().min(1, 'Bundle ID is required'),
  isPublished: z.boolean(),
});

export type PublishBundleData = z.infer<typeof publishBundleSchema>;
