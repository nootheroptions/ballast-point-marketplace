import { z } from 'zod';

/**
 * Schema for creating a new service
 */
export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(255, 'Name is too long'),
  description: z
    .string()
    .min(1, 'Service description is required')
    .max(1000, 'Description is too long'),
});

export type CreateServiceData = z.infer<typeof createServiceSchema>;

/**
 * Schema for updating a service
 */
export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(255, 'Name is too long').optional(),
  description: z
    .string()
    .min(1, 'Service description is required')
    .max(1000, 'Description is too long')
    .optional(),
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
