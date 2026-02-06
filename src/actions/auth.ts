'use server';

import { ActionResult } from '@/actions/types';
import { env } from '@/lib/config/env';
import { CURRENT_TEAM_COOKIE } from '@/lib/constants';
import { createTeamMemberRepository } from '@/lib/repositories/team-member.repo';
import { createUserProfileRepository } from '@/lib/repositories/user-profile.repo';
import { createAuthService } from '@/lib/services/auth';
import { createCookieOptions } from '@/lib/services/auth/cookie-options';
import { loginSchema, signUpSchema } from '@/lib/validations/auth';
import { cookies } from 'next/headers';

export async function signUp(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    timezone: formData.get('timezone'),
    userType: formData.get('userType'),
  };

  const validatedFields = signUpSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.message,
    };
  }

  const { email, password, timezone, userType } = validatedFields.data;

  try {
    const authService = await createAuthService();

    // Set nextUrl in redirect URL based on user type
    // so that they get redirect to correct place
    // after verifying email
    const nextUrl =
      userType === 'provider'
        ? `${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/onboarding`
        : env.NEXT_PUBLIC_SITE_URL;

    const redirectUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`;

    const { data: user, error } = await authService.signUp({
      email,
      password,
      emailRedirectTo: redirectUrl,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'Failed to create account',
      };
    }

    // Save user profile to database
    try {
      const userProfileRepository = createUserProfileRepository();
      await userProfileRepository.create({
        id: user.id,
        email: user.email,
        timezone,
      });
    } catch (dbError) {
      console.error('Failed to create user profile:', dbError);
      // Note: Supabase user is created but profile creation failed
      // Consider implementing a cleanup strategy or async profile creation
    }

    return {
      success: true,
      message: 'Please check your email to verify your account',
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.message,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const authService = await createAuthService();

    const { data, error } = await authService.signIn({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }

    // Set team membership cookie
    // MVP: Default to the first team membership (assumes user is only on one team)
    // TODO: Support multiple team memberships with team switcher UI
    const teamMemberRepository = createTeamMemberRepository();
    const teamMembership = await teamMemberRepository.getFirstTeamMembershipByUserId(data.user.id);

    if (teamMembership) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: CURRENT_TEAM_COOKIE,
        value: teamMembership.teamId,
        ...createCookieOptions(),
      });
    }

    return {
      success: true,
      message: 'Successfully signed in',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function logout(): Promise<ActionResult> {
  try {
    const authService = await createAuthService();
    const { error } = await authService.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Clear team membership cookie
    const cookieStore = await cookies();
    cookieStore.delete(CURRENT_TEAM_COOKIE);

    return {
      success: true,
      message: 'Successfully logged out',
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
