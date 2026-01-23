/**
 * Provider onboarding API contracts (request and response DTOs)
 */

import { z } from 'zod';

// ============================================
// REQUEST DTOs (Zod schemas)
// ============================================

/** Slug validation: lowercase letters, numbers, and hyphens only */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Step 1: Business name and URL slug */
export const step1Schema = z.object({
  name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'URL slug is required')
    .max(50, 'URL slug must be less than 50 characters')
    .regex(slugRegex, 'URL slug can only contain lowercase letters, numbers, and hyphens'),
});

export type Step1Request = z.infer<typeof step1Schema>;

/** Step 2: Business description */
export const step2Schema = z.object({
  description: z
    .string()
    .min(1, 'Description must be at least 1 characters')
    .max(600, 'Description must be less than 600 characters'),
});

export type Step2Request = z.infer<typeof step2Schema>;

/** Save partial onboarding progress (all fields optional) */
export const saveProgressSchema = z.object({
  currentStep: z.number().min(0).max(2),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export type SaveProgressRequest = z.infer<typeof saveProgressSchema>;

/** Complete onboarding (all required fields) - composed from step schemas */
export const completeOnboardingSchema = step1Schema.merge(step2Schema);

export type CompleteOnboardingRequest = z.infer<typeof completeOnboardingSchema>;

/** Check slug availability */
export const checkSlugSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export type CheckSlugRequest = z.infer<typeof checkSlugSchema>;

// ============================================
// RESPONSE DTOs (Plain types)
// ============================================

/** Current onboarding progress state */
export type OnboardingProgressResponse = {
  currentStep: number;
  name: string | null;
  slug: string | null;
  description: string | null;
};

/** Slug availability check result */
export type CheckSlugAvailabilityResponse = {
  available: boolean;
};
