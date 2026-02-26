import { createAuthService } from '@/lib/services/auth';
import { createOutlookCalendarService } from '@/lib/services/calendar';
import { env } from '@/lib/config/env';
import { NextResponse } from 'next/server';

/**
 * Initiates Microsoft Outlook Calendar OAuth flow
 * GET /api/auth/calendar/outlook
 *
 * Redirects user to Microsoft's OAuth consent screen
 */
export async function GET() {
  try {
    // Verify user is authenticated
    const authService = await createAuthService();
    const { data: session, error } = await authService.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if Microsoft OAuth is configured
    if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Outlook Calendar integration is not configured' },
        { status: 503 }
      );
    }

    const calendarService = createOutlookCalendarService();

    // Generate OAuth URL with state for CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        userId: session.user.id,
        timestamp: Date.now(),
      })
    ).toString('base64');

    const redirectUri = `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/api/auth/calendar/outlook/callback`;
    const authUrl = calendarService.getAuthUrl(redirectUri, state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Outlook OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Outlook Calendar authorization' },
      { status: 500 }
    );
  }
}
