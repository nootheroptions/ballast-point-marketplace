import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Basic Authentication
  BASIC_AUTH_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
  BASIC_AUTH_USER: z.string().optional(),
  BASIC_AUTH_PASSWORD: z.string().optional(),

  // Supabase (client-side)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Site URL
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

// Validate and export
export const env = envSchema.parse(process.env);
