'use server';

import { ActionResult } from '@/actions/types';
import { prisma } from '@/lib/db/prisma';
import { createAuthService } from '@/lib/services/auth';
import { loginSchema, signUpSchema } from '@/lib/validations/auth';
import { env } from '@/lib/config/env';

export async function signUp(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const validatedFields = signUpSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.message,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const authService = await createAuthService();

    const { data: user, error } = await authService.signUp({
      email,
      password,
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
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
      await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email,
        },
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
