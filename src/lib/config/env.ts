import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variables configuration using T3 Env.
 *
 * This provides:
 * - Type-safe access to environment variables
 * - Runtime validation with Zod
 * - Build-time validation (when imported in next.config.ts)
 * - Automatic client/server separation enforcement
 *
 * Usage:
 *   import { env } from '@/lib/config/env';
 *
 *   // Works on both client and server
 *   const mapboxToken = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
 *
 *   // Only works on server (throws error on client)
 *   const dbUrl = env.DATABASE_URL;
 */
export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * These are NEVER exposed to the client.
   */
  server: {
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database (server-only - NEVER expose to client!)
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),

    // Basic Authentication
    BASIC_AUTH_ENABLED: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
    BASIC_AUTH_USER: z.string().optional(),
    BASIC_AUTH_PASSWORD: z.string().optional(),
    SUPABASE_STORAGE_BUCKET: z.string().min(1).default('public-marketplace-images'),
  },

  /**
   * Client-side environment variables schema.
   * Must be prefixed with NEXT_PUBLIC_.
   * These are embedded in the client bundle at build time.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_ROOT_APP_DOMAIN: z.string().default('localhost.com'),
    NEXT_PUBLIC_PROVIDER_DASHBOARD_URL: z.string().url(),
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1, 'Mapbox access token is required'),
  },

  /**
   * Manual destructuring is REQUIRED due to Next.js bundling behavior.
   * You MUST explicitly list each variable here.
   *
   * This ensures the variables are not stripped from the bundle.
   */
  runtimeEnv: {
    // Server variables
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    BASIC_AUTH_ENABLED: process.env.BASIC_AUTH_ENABLED,
    BASIC_AUTH_USER: process.env.BASIC_AUTH_USER,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,

    // Client variables (NEXT_PUBLIC_*)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ROOT_APP_DOMAIN: process.env.NEXT_PUBLIC_ROOT_APP_DOMAIN,
    NEXT_PUBLIC_PROVIDER_DASHBOARD_URL: process.env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },

  /**
   * Skip validation when building on Vercel
   * (Vercel injects env vars after validation would run)
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes error messages more readable
   */
  emptyStringAsUndefined: true,
});
