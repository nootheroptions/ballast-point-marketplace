import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { createCalendarIntegrationRepository } from '@/lib/repositories/calendar-integration.repo';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { createAuthService } from '@/lib/services/auth';
import { createOutlookCalendarService } from '@/lib/services/calendar';

/**
 * Handles Microsoft Outlook Calendar OAuth callback
 * GET /api/auth/calendar/outlook/callback
 *
 * Exchanges authorization code for tokens and stores the integration
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const integrationsUrl = `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/integrations`;

  // Handle user cancellation or error
  if (error) {
    console.error('Outlook OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${integrationsUrl}?error=oauth_cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${integrationsUrl}?error=no_code`);
  }

  try {
    // Verify user is authenticated
    const authService = await createAuthService();
    const { data: session, error: authError } = await authService.getSession();

    if (authError || !session) {
      return NextResponse.redirect(`${integrationsUrl}?error=not_authenticated`);
    }

    // Validate required state parameter (CSRF protection)
    if (!state) {
      return NextResponse.redirect(`${integrationsUrl}?error=invalid_state`);
    }

    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString()) as {
        userId?: unknown;
        timestamp?: unknown;
      };

      if (typeof stateData.userId !== 'string' || stateData.userId !== session.user.id) {
        return NextResponse.redirect(`${integrationsUrl}?error=invalid_state`);
      }

      if (typeof stateData.timestamp !== 'number' || !Number.isFinite(stateData.timestamp)) {
        return NextResponse.redirect(`${integrationsUrl}?error=invalid_state`);
      }

      // Check timestamp is not too old (5 minutes)
      const stateAgeMs = Date.now() - stateData.timestamp;
      if (stateAgeMs < 0 || stateAgeMs > 5 * 60 * 1000) {
        return NextResponse.redirect(`${integrationsUrl}?error=state_expired`);
      }
    } catch {
      return NextResponse.redirect(`${integrationsUrl}?error=invalid_state`);
    }

    // Get team membership
    const cookieStore = await cookies();
    const teamId = cookieStore.get(CURRENT_TEAM_COOKIE)?.value;

    if (!teamId) {
      return NextResponse.redirect(`${integrationsUrl}?error=no_team`);
    }

    const teamMemberRepo = createTeamMemberRepository();
    const teamMember = await teamMemberRepo.findByUserAndTeam(session.user.id, teamId);

    if (!teamMember) {
      return NextResponse.redirect(`${integrationsUrl}?error=not_team_member`);
    }

    // Exchange code for tokens
    const calendarService = createOutlookCalendarService();
    const redirectUri = `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/api/auth/calendar/outlook/callback`;
    const tokenResult = await calendarService.exchangeCodeForTokens(code, redirectUri);

    if (tokenResult.error || !tokenResult.data) {
      console.error('Outlook token exchange failed:', tokenResult.error);
      return NextResponse.redirect(`${integrationsUrl}?error=token_exchange_failed`);
    }

    // Store the integration
    const calendarIntegrationRepo = createCalendarIntegrationRepository();

    // Remove any existing integration for this team member
    await calendarIntegrationRepo.deleteByTeamMemberId(teamMember.id);

    // Create new integration
    await calendarIntegrationRepo.create({
      teamMemberId: teamMember.id,
      provider: 'OUTLOOK',
      accessToken: tokenResult.data.accessToken,
      refreshToken: tokenResult.data.refreshToken,
      tokenExpiry: tokenResult.data.expiresAt,
      calendarId: tokenResult.data.calendarId,
      calendarEmail: tokenResult.data.calendarEmail,
    });

    return NextResponse.redirect(`${integrationsUrl}?success=outlook_connected`);
  } catch (error) {
    console.error('Outlook OAuth callback error:', error);
    return NextResponse.redirect(`${integrationsUrl}?error=unexpected_error`);
  }
}
