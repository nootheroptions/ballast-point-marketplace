/**
 * Action wrapper utilities for Next.js Server Actions
 *
 * Provides Higher-Order Functions (HOFs) to eliminate boilerplate for:
 * - Authentication
 * - Input validation
 * - Error handling
 *
 * Usage:
 * ```typescript
 * // Authenticated action with validation
 * export const saveProgress = createAuthenticatedAction(
 *   saveProgressSchema,
 *   async (data, user) => {
 *     // user is automatically injected, data is validated
 *     await repository.save({ ...data, userId: user.id });
 *   }
 * );
 *
 * // Authenticated action without validation
 * export const getProgress = createAuthenticatedAction(
 *   async (user) => {
 *     const data = await repository.findByUserId(user.id);
 *     return { data };
 *   }
 * );
 *
 * // Public action with validation
 * export const checkSlug = createAction(
 *   slugSchema,
 *   async (data) => {
 *     const exists = await repository.findBySlug(data.slug);
 *     return { available: !exists };
 *   }
 * );
 * ```
 */

import { requireUser, UnauthorizedError } from '@/lib/auth/server-auth';
import type { ActionResult } from '@/actions/types';
import type { AuthUser } from '@/lib/services/auth/types';
import type { ZodSchema } from 'zod';

/**
 * Handler function that receives validated data and authenticated user
 */
type AuthenticatedHandler<TInput, TOutput> = (
  data: TInput,
  user: AuthUser
) => Promise<ActionResult<TOutput> | TOutput>;

/**
 * Handler function that receives only the authenticated user (no input validation)
 */
type AuthenticatedHandlerNoInput<TOutput> = (
  user: AuthUser
) => Promise<ActionResult<TOutput> | TOutput>;

/**
 * Handler function that receives validated data (no authentication)
 */
type PublicHandler<TInput, TOutput> = (data: TInput) => Promise<ActionResult<TOutput> | TOutput>;

/**
 * Handler function with no input validation or authentication
 */
type PublicHandlerNoInput<TOutput> = () => Promise<ActionResult<TOutput> | TOutput>;

/**
 * Normalize handler result to ActionResult format
 * If handler returns data directly, wrap it in ActionResult
 */
function normalizeResult<T>(result: ActionResult<T> | T): ActionResult<T> {
  // If it's already an ActionResult, return as-is
  if (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    typeof result.success === 'boolean'
  ) {
    return result as ActionResult<T>;
  }

  // Otherwise, wrap the result
  return {
    success: true,
    data: result as T,
  };
}

/**
 * Create an authenticated action with automatic validation and auth handling
 *
 * @param schemaOrHandler - Zod schema for validation OR handler function if no validation needed
 * @param handler - Handler function (only if schema is provided)
 * @returns Server action with auth and validation handled automatically
 *
 * @example
 * // With validation
 * export const saveData = createAuthenticatedAction(
 *   saveSchema,
 *   async (data, user) => {
 *     await repository.save({ ...data, userId: user.id });
 *   }
 * );
 *
 * @example
 * // Without validation
 * export const getData = createAuthenticatedAction(
 *   async (user) => {
 *     const data = await repository.findByUserId(user.id);
 *     return { data };
 *   }
 * );
 */
export function createAuthenticatedAction<TOutput>(
  handler: AuthenticatedHandlerNoInput<TOutput>
): () => Promise<ActionResult<TOutput>>;

export function createAuthenticatedAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: AuthenticatedHandler<TInput, TOutput>
): (data: TInput) => Promise<ActionResult<TOutput>>;

export function createAuthenticatedAction<TInput, TOutput>(
  schemaOrHandler: ZodSchema<TInput> | AuthenticatedHandlerNoInput<TOutput>,
  handler?: AuthenticatedHandler<TInput, TOutput>
): (data?: TInput) => Promise<ActionResult<TOutput>> {
  // Case 1: No schema, handler only (no input validation)
  if (typeof schemaOrHandler === 'function') {
    const handlerFn = schemaOrHandler as AuthenticatedHandlerNoInput<TOutput>;

    return async () => {
      try {
        const user = await requireUser();
        const result = await handlerFn(user);
        return normalizeResult(result);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return {
            success: false,
            error: error.message,
          };
        }

        console.error('Action error:', error);
        return {
          success: false,
          error: 'An unexpected error occurred',
        };
      }
    };
  }

  // Case 2: Schema + handler (with validation)
  const schema = schemaOrHandler as ZodSchema<TInput>;
  const handlerFn = handler as AuthenticatedHandler<TInput, TOutput>;

  return async (data: TInput) => {
    try {
      const user = await requireUser();

      // Validate input
      const validatedData = schema.safeParse(data);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.issues[0]?.message ?? 'Invalid data',
        };
      }

      const result = await handlerFn(validatedData.data, user);
      return normalizeResult(result);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error('Action error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };
}

/**
 * Create a public action (no authentication) with optional validation
 *
 * @param schemaOrHandler - Zod schema for validation OR handler function if no validation needed
 * @param handler - Handler function (only if schema is provided)
 * @returns Server action with validation handled automatically
 *
 * @example
 * // With validation
 * export const checkSlug = createAction(
 *   slugSchema,
 *   async (data) => {
 *     const exists = await repository.findBySlug(data.slug);
 *     return { available: !exists };
 *   }
 * );
 *
 * @example
 * // Without validation
 * export const getPublicData = createAction(
 *   async () => {
 *     const data = await repository.getPublicData();
 *     return { data };
 *   }
 * );
 */
export function createAction<TOutput>(
  handler: PublicHandlerNoInput<TOutput>
): () => Promise<ActionResult<TOutput>>;

export function createAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: PublicHandler<TInput, TOutput>
): (data: TInput) => Promise<ActionResult<TOutput>>;

export function createAction<TInput, TOutput>(
  schemaOrHandler: ZodSchema<TInput> | PublicHandlerNoInput<TOutput>,
  handler?: PublicHandler<TInput, TOutput>
): (data?: TInput) => Promise<ActionResult<TOutput>> {
  // Case 1: No schema, handler only (no input validation)
  if (typeof schemaOrHandler === 'function') {
    const handlerFn = schemaOrHandler as PublicHandlerNoInput<TOutput>;

    return async () => {
      try {
        const result = await handlerFn();
        return normalizeResult(result);
      } catch (error) {
        console.error('Action error:', error);
        return {
          success: false,
          error: 'An unexpected error occurred',
        };
      }
    };
  }

  // Case 2: Schema + handler (with validation)
  const schema = schemaOrHandler as ZodSchema<TInput>;
  const handlerFn = handler as PublicHandler<TInput, TOutput>;

  return async (data: TInput) => {
    try {
      // Validate input
      const validatedData = schema.safeParse(data);

      if (!validatedData.success) {
        return {
          success: false,
          error: validatedData.error.issues[0]?.message ?? 'Invalid data',
        };
      }

      const result = await handlerFn(validatedData.data);
      return normalizeResult(result);
    } catch (error) {
      console.error('Action error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };
}
