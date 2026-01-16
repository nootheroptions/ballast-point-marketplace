/**
 * Shared types for server actions
 */

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}
