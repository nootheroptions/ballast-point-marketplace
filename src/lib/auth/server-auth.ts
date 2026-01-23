/**
 * Server-side authentication utilities for Next.js Server Actions and API Routes
 *
 * Provides centralized authentication logic to avoid repetition across actions.
 * Follows Next.js best practices by throwing errors that can be caught in try-catch blocks.
 */

import { createAuthService } from '@/lib/services/auth';
import type { AuthUser } from '@/lib/services/auth/types';

/**
 * Custom error class for authentication failures
 * Allows differentiation from other errors in catch blocks
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Get the currently authenticated user or throw an error
 *
 * Use this in Server Actions and API Routes that require authentication.
 * The error will be caught by the action's try-catch block and can be
 * converted to an appropriate ActionResult.
 *
 * @param errorMessage - Custom error message for this specific context
 * @throws {UnauthorizedError} When user is not authenticated
 * @returns {Promise<AuthUser>} The authenticated user
 *
 * @example
 * ```typescript
 * export async function myAction() {
 *   try {
 *     const user = await requireUser('You must be logged in to perform this action');
 *     // ... rest of action logic
 *   } catch (error) {
 *     if (error instanceof UnauthorizedError) {
 *       return { success: false, error: error.message };
 *     }
 *     // Handle other errors...
 *   }
 * }
 * ```
 */
export async function requireUser(errorMessage = 'Authentication required'): Promise<AuthUser> {
  const authService = await createAuthService();
  const { data: user, error } = await authService.getUser();

  if (error || !user) {
    throw new UnauthorizedError(errorMessage);
  }

  return user;
}

/**
 * Get the currently authenticated user or return null
 *
 * Use this when authentication is optional and you want to handle
 * the unauthenticated case manually.
 *
 * @returns {Promise<AuthUser | null>} The authenticated user or null
 *
 * @example
 * ```typescript
 * export async function myAction() {
 *   const user = await getCurrentUser();
 *   if (!user) {
 *     // Handle unauthenticated case
 *     return { success: false, error: 'Login required' };
 *   }
 *   // ... rest of action logic
 * }
 * ```
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const authService = await createAuthService();
  const { data: user, error } = await authService.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
