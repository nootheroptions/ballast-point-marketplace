// Re-export types
export * from './types';

// Export Supabase client utilities
export { createClient, createServerSupabaseClient } from './supabase-client';

// Export the active implementation
// To swap implementations, change the import below to your new provider
export { createSupabaseAuthService as createAuthService } from './supabase';
