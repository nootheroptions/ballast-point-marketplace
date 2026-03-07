import type { MetadataRoute } from 'next';
import { env } from '@/lib/config/env';

const BASE_URL = env.NEXT_PUBLIC_SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/signup',
          '/auth-code-error',
          '/onboarding',
          '/*/book',
          '/*/confirm',
          '/*/success',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
