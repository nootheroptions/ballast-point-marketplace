import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import { createCookieOptions } from './cookie-options';

/**
 * Create a Supabase client for use in browser/client components
 */
export function createClient() {
  const cookieOptions = createCookieOptions();

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions,
  });
}

/**
 * Create a Supabase client for use in server components and server actions
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const cookieOptions = createCookieOptions();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll: (newCookies) => {
        try {
          for (const { name, value, options } of newCookies) {
            cookieStore.set(name, value, {
              ...options,
              ...cookieOptions,
            });
          }
        } catch {}
      },
    },
  });
}
