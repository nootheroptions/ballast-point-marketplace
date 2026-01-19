import { withBasicAuth } from '@/lib/auth/basic-auth';
import { env } from '@/lib/config/env';
import { createCookieOptions } from '@/lib/services/auth/cookie-options';
import { withSubdomainRouting } from '@/lib/middleware/subdomain-routing';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Basic auth check (for staging environments)
  if (env.BASIC_AUTH_ENABLED) {
    const authResponse = withBasicAuth(request);
    if (authResponse) return authResponse;
  }

  const url = request.nextUrl.clone();

  // Auth paths that should not trigger protected subdomain redirect
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => url.pathname.startsWith(path));

  // Create response to modify cookies
  let response = NextResponse.next({
    request,
  });

  // Create Supabase client for middleware
  const cookieOptions = createCookieOptions();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll: (newCookies) => {
          for (const { name, value } of newCookies) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of newCookies) {
            response.cookies.set(name, value, {
              ...options,
              ...cookieOptions,
            });
          }
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle subdomain routing and authentication
  const subdomainResponse = withSubdomainRouting(request, user, response);
  if (subdomainResponse) return subdomainResponse;

  // Protected routes check (for main domain protected paths)
  const protectedPaths: string[] = [];
  const isProtectedPath = protectedPaths.some((path) => url.pathname.startsWith(path));

  if (isProtectedPath && !user) {
    // Construct login URL on main domain
    const loginUrl = new URL('/login', env.NEXT_PUBLIC_SITE_URL);

    // Store the original URL to redirect back after login
    const originalUrl = url.toString();
    loginUrl.searchParams.set('redirectTo', originalUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && user) {
    const redirectTo = url.searchParams.get('redirectTo');
    const redirectUrl = redirectTo || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
