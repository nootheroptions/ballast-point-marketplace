import { z } from 'zod';

export const applicationTypeSchema = z.enum(['guest', 'co-host']);

export const podcastApplicationSchema = z.object({
  applicationType: applicationTypeSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  city: z.string().min(1, 'City is required'),
  linkedinUrl: z
    .string()
    .min(1, 'LinkedIn URL is required')
    .url('Please enter a valid URL')
    .refine((url) => url.includes('linkedin.com'), 'Please enter a valid LinkedIn URL'),
  industryExpertise: z
    .string()
    .min(1, 'Industry expertise is required')
    .min(50, 'Please provide at least 50 characters'),
  uniqueInsight: z
    .string()
    .min(1, 'This field is required')
    .min(100, 'Please provide at least 100 characters'),
  workSampleUrl: z.string().min(1, 'Work sample URL is required').url('Please enter a valid URL'),
});

export type ApplicationType = z.infer<typeof applicationTypeSchema>;
export type PodcastApplicationFormData = z.infer<typeof podcastApplicationSchema>;
