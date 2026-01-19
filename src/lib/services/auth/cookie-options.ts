import { env } from '@/lib/config/env';

/**
 * Cookie options for Supabase auth to enable
 * cross-subdomain authentication.
 *
 * This factory should be used by all Supabase clients
 * (browser, server, middleware) to ensure consistent
 * cookie configuration.
 */
export function createCookieOptions() {
  const authDomain = env.NEXT_PUBLIC_ROOT_APP_DOMAIN;

  // If no auth domain is configured, return undefined to use Supabase defaults
  if (!authDomain) {
    return undefined;
  }

  return {
    domain: `.${authDomain}`,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    // Cookie valid for 30 days
    maxAge: 60 * 60 * 24 * 30,
  };
}
