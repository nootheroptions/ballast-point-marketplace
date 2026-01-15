import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withBasicAuth } from '@/lib/auth/basic-auth';

export function middleware(request: NextRequest) {
  if (process.env.BASIC_AUTH_ENABLED === 'true') {
    const authResponse = withBasicAuth(request);
    if (authResponse) return authResponse;
  }

  return NextResponse.next();
}

export const config = {
  // Runs middleware on all routes EXCEPT: _next/static (JS/CSS bundles), _next/image (optimized images), favicon.ico
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
