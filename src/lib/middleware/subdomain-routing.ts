import { env } from '@/lib/config/env';
import { createCookieOptions } from '@/lib/services/auth/cookie-options';
import { getRouteGroupForSubdomain, getSubdomain } from '@/lib/utils/subdomain';
import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Subdomains that require authentication.
 * Users will be redirected to login on the main domain if not authenticated.
 */
const PROTECTED_SUBDOMAINS = ['providers'];

/**
 * Handles subdomain routing logic including:
 * - Protected subdomain authentication checks
 * - Route group rewrites for subdomain-specific paths
 *
 * @returns NextResponse with rewrite applied, or redirect to login if auth required, or null if no subdomain handling needed
 */
export function withSubdomainRouting(
  request: NextRequest,
  user: User | null,
  response: NextResponse
): NextResponse | null {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Extract subdomain and determine route group
  const subdomain = getSubdomain(hostname, env.NEXT_PUBLIC_ROOT_APP_DOMAIN);
  const routeGroup = getRouteGroupForSubdomain(subdomain);
  const isProtectedSubdomain = PROTECTED_SUBDOMAINS.includes(subdomain);

  // Protected subdomain check - redirect to main domain login if not authenticated
  if (isProtectedSubdomain && !user) {
    // Construct login URL on main domain
    const loginUrl = new URL('/login', env.NEXT_PUBLIC_SITE_URL);

    // Store the original subdomain URL to redirect back after login
    const protocol = request.nextUrl.protocol;
    const originalUrl = `${protocol}//${hostname}${url.pathname}${url.search}`;
    loginUrl.searchParams.set('redirectTo', originalUrl);

    return NextResponse.redirect(loginUrl.toString());
  }

  // Rewrite to subdomain route group if applicable (after auth check)
  // Don't rewrite Next.js server action requests (they have Next-Action header)
  const isServerAction = request.headers.get('Next-Action') !== null;

  if (
    routeGroup &&
    !url.pathname.startsWith('/_next') &&
    !url.pathname.startsWith('/api') &&
    !isServerAction
  ) {
    url.pathname = `${routeGroup}${url.pathname}`;

    // Preserve cookies from the original response (includes Supabase session cookies)
    const previousResponseCookies = response.cookies.getAll();

    // Create rewrite response
    const rewriteResponse = NextResponse.rewrite(url);

    // Re-apply cookies from previous response to maintain session
    const cookieOptions = createCookieOptions();
    previousResponseCookies.forEach((cookie) => {
      rewriteResponse.cookies.set({
        ...cookie,
        ...cookieOptions,
      });
    });

    return rewriteResponse;
  }

  return null;
}
