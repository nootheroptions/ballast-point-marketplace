import type { NextConfig } from 'next';

// Validate environment variables at build time
import { env } from './src/lib/config/env';

const supabaseHostname = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;

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
        hostname: 'insights-assets.kyzon.com',
      }, // TO DO: remove this once we set up with mat's actual one
    ],
  },
};

export default nextConfig;
