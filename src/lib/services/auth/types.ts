/**
 * Auth service abstraction layer
 * Allows swapping authentication providers (Supabase, Auth0, Clerk, etc.)
 * by implementing this interface
 */

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
  emailRedirectTo?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

export interface AuthService {
  // Authentication
  signUp(credentials: SignUpCredentials): Promise<AuthResult<AuthUser>>;
  signIn(credentials: SignInCredentials): Promise<AuthResult<AuthSession>>;
  signOut(): Promise<AuthResult>;

  // Session management
  getSession(): Promise<AuthResult<AuthSession>>;
  getUser(): Promise<AuthResult<AuthUser>>;
  refreshSession(): Promise<AuthResult<AuthSession>>;

  // Password management
  resetPassword(email: string): Promise<AuthResult>;
  updatePassword(newPassword: string): Promise<AuthResult>;

  // Email verification
  resendVerificationEmail(email: string): Promise<AuthResult>;
}

export type AuthServiceFactory = () => Promise<AuthService>;
