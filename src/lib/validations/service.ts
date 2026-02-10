import { DeliveryMode, TemplateKey } from '@prisma/client';
import { z } from 'zod';
import {
  consultationTemplateDataSchema,
  feasibilityTemplateDataSchema,
  conceptDesignTemplateDataSchema,
  planningApprovalsTemplateDataSchema,
  reviewTemplateDataSchema,
} from './template-data';

/**
 * Regex pattern for valid slugs: lowercase letters, numbers, and hyphens
 * Must start and end with alphanumeric character
 */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Add-on attachment schema (used for both services and bundles)
 */
const addOnAttachmentSchema = z.object({
  addOnKey: z.string(),
  priceCents: z.number().int().min(0),
  turnaroundImpactDays: z.number().int(),
});

/**
 * Base fields shared by all services
 */
const baseServiceFields = {
  name: z.string().min(1, 'Service name is required').max(255, 'Name is too long'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug is too long')
    .regex(slugPattern, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .min(1, 'Service description is required')
    .max(2000, 'Description is too long'),
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional(),
};

/**
 * Booking fields required for all bookable services
 */
const bookingFields = {
  slotDuration: z.number().int().min(1, 'Slot duration must be at least 1 minute'),
  slotBuffer: z.number().int().min(0, 'Slot buffer must be non-negative'),
  advanceBookingMin: z.number().int().min(0, 'Advance booking minimum must be non-negative'),
  advanceBookingMax: z.number().int().min(0, 'Advance booking maximum must be non-negative'),
};

/**
 * Base schema for common service fields
 */
const baseMarketplaceServiceSchema = z.object({
  ...baseServiceFields,

  // Common marketplace fields
  coveragePackageKey: z.string().min(1, 'Coverage package is required'),
  priceCents: z.number().int().min(0, 'Price must be non-negative').max(10000000, 'Price too high'),
  leadTimeDays: z.number().int().min(0, 'Lead time must be non-negative'),
  turnaroundDays: z.number().int().min(1, 'Turnaround must be at least 1 day'),
  deliveryMode: z.nativeEnum(DeliveryMode, { message: 'Delivery mode is required' }),

  // Optional marketplace fields
  positioning: z.string().max(200).optional(),
  assumptions: z.string().max(1000).optional(),
  clientResponsibilities: z.array(z.string()).optional(),
  addOns: z.array(addOnAttachmentSchema).optional(),

  // Booking fields (required - marketplace services are bookable)
  ...bookingFields,
});

/**
 * Schema for creating a marketplace service
 * Uses discriminated union to validate templateData based on templateKey
 */
export const createServiceSchema = z
  .discriminatedUnion('templateKey', [
    baseMarketplaceServiceSchema.extend({
      templateKey: z.literal(TemplateKey.CONSULTATION),
      templateData: consultationTemplateDataSchema,
    }),
    baseMarketplaceServiceSchema.extend({
      templateKey: z.literal(TemplateKey.FEASIBILITY),
      templateData: feasibilityTemplateDataSchema,
    }),
    baseMarketplaceServiceSchema.extend({
      templateKey: z.literal(TemplateKey.CONCEPT_DESIGN),
      templateData: conceptDesignTemplateDataSchema,
    }),
    baseMarketplaceServiceSchema.extend({
      templateKey: z.literal(TemplateKey.PLANNING_APPROVALS),
      templateData: planningApprovalsTemplateDataSchema,
    }),
    baseMarketplaceServiceSchema.extend({
      templateKey: z.literal(TemplateKey.REVIEW),
      templateData: reviewTemplateDataSchema,
    }),
  ])
  .superRefine((data, ctx) => {
    // Additional cross-field validation can go here
    if (data.advanceBookingMax < data.advanceBookingMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum advance booking must be greater than minimum',
        path: ['advanceBookingMax'],
      });
    }
  });

export type CreateServiceData = z.infer<typeof createServiceSchema>;

/**
 * Schema for updating a service
 * All fields are optional - only provide fields you want to update
 */
export const updateServiceSchema = z.object({
  // Basic fields
  name: z.string().min(1, 'Service name is required').max(255, 'Name is too long').optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug is too long')
    .regex(slugPattern, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z
    .string()
    .min(1, 'Service description is required')
    .max(2000, 'Description is too long')
    .optional(),
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional(),

  // Marketplace fields
  templateKey: z.nativeEnum(TemplateKey).optional(),
  templateData: z.record(z.string(), z.unknown()).optional(),
  coveragePackageKey: z.string().optional(),
  priceCents: z.number().int().min(0).max(10000000).optional(),
  leadTimeDays: z.number().int().min(0).optional(),
  turnaroundDays: z.number().int().min(1).optional(),
  deliveryMode: z.nativeEnum(DeliveryMode).optional(),
  positioning: z.string().max(200).optional(),
  assumptions: z.string().max(1000).optional(),
  clientResponsibilities: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  addOns: z.array(addOnAttachmentSchema).optional(),

  // Booking fields
  slotDuration: z.number().int().min(1).optional(),
  slotBuffer: z.number().int().min(0).optional(),
  advanceBookingMin: z.number().int().min(0).optional(),
  advanceBookingMax: z.number().int().min(0).optional(),
});

export type UpdateServiceData = z.infer<typeof updateServiceSchema>;

/**
 * Schema for getting a service by ID
 */
export const getServiceByIdSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
});

export type GetServiceByIdData = z.infer<typeof getServiceByIdSchema>;

/**
 * Schema for updating a service with ID
 */
export const updateServiceWithIdSchema = updateServiceSchema.extend({
  id: z.string().min(1, 'Service ID is required'),
});

export type UpdateServiceWithIdData = z.infer<typeof updateServiceWithIdSchema>;

/**
 * Schema for deleting a service
 */
export const deleteServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
});

export type DeleteServiceData = z.infer<typeof deleteServiceSchema>;

/**
 * Schema for listing services by provider ID
 */
export const listServicesSchema = z.object({
  providerProfileId: z.string().min(1, 'Provider ID is required'),
});

export type ListServicesParams = z.infer<typeof listServicesSchema>;

/**
 * Schema for publishing/unpublishing a service
 */
export const publishServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  isPublished: z.boolean(),
});

export type PublishServiceData = z.infer<typeof publishServiceSchema>;
