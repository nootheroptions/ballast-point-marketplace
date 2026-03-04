import type { NextConfig } from 'next';

// Validate environment variables at build time
import { env } from './src/lib/config/env';

const supabaseHostname = new URL(env.SUPABASE_URL).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'hyvor.com',
      },
      {
        protocol: 'https',
        hostname: '*.hyvor.com',
      },
      {
        protocol: 'https',
        hostname: 'buildipedia.hyvorblogs.io',
      },
    ],
  },
};

export default nextConfig;
