import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import { createCookieOptions } from './cookie-options';

/**
 * Create a Supabase client for use in server components and server actions
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const cookieOptions = createCookieOptions();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
