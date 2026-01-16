import { createServerSupabaseClient } from './supabase-client';
import type {
  AuthService,
  AuthResult,
  AuthUser,
  AuthSession,
  SignUpCredentials,
  SignInCredentials,
  AuthError,
} from './types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

function mapSupabaseError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'message' in error) {
    const supaError = error as { message: string; code?: string; status?: number };
    return {
      code: supaError.code ?? 'UNKNOWN_ERROR',
      message: supaError.message,
      status: supaError.status,
    };
  }
  return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
}

function mapSupabaseUser(user: SupabaseUser): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    emailVerified: !!user.email_confirmed_at,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at ?? user.created_at),
    metadata: user.user_metadata,
  };
}

export async function createSupabaseAuthService(): Promise<AuthService> {
  const supabase = await createServerSupabaseClient();

  return {
    async signUp(credentials: SignUpCredentials): Promise<AuthResult<AuthUser>> {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: credentials.metadata,
          emailRedirectTo: credentials.emailRedirectTo,
        },
      });

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }

      if (!data.user) {
        return { data: null, error: { code: 'NO_USER', message: 'User not created' } };
      }

      return { data: mapSupabaseUser(data.user), error: null };
    },

    async signIn(credentials: SignInCredentials): Promise<AuthResult<AuthSession>> {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }

      if (!data.session || !data.user) {
        return { data: null, error: { code: 'NO_SESSION', message: 'Session not created' } };
      }

      return {
        data: {
          user: mapSupabaseUser(data.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
        },
        error: null,
      };
    },

    async signOut(): Promise<AuthResult> {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }
      return { data: null, error: null };
    },

    async getSession(): Promise<AuthResult<AuthSession>> {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }

      if (!data.session) {
        return { data: null, error: null };
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { data: null, error: { code: 'NO_USER', message: 'User not found' } };
      }

      return {
        data: {
          user: mapSupabaseUser(userData.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
        },
        error: null,
      };
    },

    async getUser(): Promise<AuthResult<AuthUser>> {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }

      if (!data.user) {
        return { data: null, error: null };
      }

      return { data: mapSupabaseUser(data.user), error: null };
    },

    async refreshSession(): Promise<AuthResult<AuthSession>> {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }

      if (!data.session || !data.user) {
        return { data: null, error: { code: 'NO_SESSION', message: 'Failed to refresh session' } };
      }

      return {
        data: {
          user: mapSupabaseUser(data.user),
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
        },
        error: null,
      };
    },

    async resetPassword(email: string): Promise<AuthResult> {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }
      return { data: null, error: null };
    },

    async updatePassword(newPassword: string): Promise<AuthResult> {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }
      return { data: null, error: null };
    },

    async resendVerificationEmail(email: string): Promise<AuthResult> {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        return { data: null, error: mapSupabaseError(error) };
      }
      return { data: null, error: null };
    },
  };
}
