import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '@/lib/config/env';

const REALM = 'Secure Area';

function unauthorized(message = 'Authentication required') {
  return new NextResponse(message, {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

function parseAuthHeader(header: string): { user: string; password: string } | null {
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return null;

  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [user, password] = decoded.split(':');
    return user && password ? { user, password } : null;
  } catch {
    return null;
  }
}

export function withBasicAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return unauthorized();

  const credentials = parseAuthHeader(authHeader);
  if (!credentials) return unauthorized('Invalid credentials');

  const validUser = env.BASIC_AUTH_USER;
  const validPassword = env.BASIC_AUTH_PASSWORD;

  if (!validUser || !validPassword) {
    console.error('Basic auth enabled but credentials not configured');
    return unauthorized();
  }

  if (credentials.user !== validUser || credentials.password !== validPassword) {
    return unauthorized('Invalid credentials');
  }

  return null;
}
