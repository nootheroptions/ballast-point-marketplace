import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { env } from '@/lib/config/env';
import { serializeJsonLd } from '@/lib/utils/json-ld';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Buildipedia | Architecture Services Marketplace',
    template: '%s | Buildipedia',
  },
  description:
    'Find and book productized architecture services. Compare services from experienced architects with fixed pricing, clear scope, and fast turnaround.',
  keywords: [
    'architecture services',
    'architects',
    'home design',
    'feasibility study',
    'concept design',
    'planning consultation',
    'residential architecture',
    'architectural design',
  ],
  authors: [{ name: 'Buildipedia' }],
  creator: 'Buildipedia',
  publisher: 'Buildipedia',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Buildipedia',
    title: 'Buildipedia | Architecture Services Marketplace',
    description:
      'Find and book productized architecture services. Compare services from experienced architects with fixed pricing, clear scope, and fast turnaround.',
    images: [
      {
        url: '/marketplace-preview.png',
        width: 1200,
        height: 630,
        alt: 'Buildipedia - Architecture Services Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buildipedia | Architecture Services Marketplace',
    description:
      'Find and book productized architecture services. Compare services from experienced architects with fixed pricing, clear scope, and fast turnaround.',
    images: ['/marketplace-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'add-your-google-verification-code',
  },
  alternates: {
    canonical: '/',
  },
} satisfies Metadata;

const baseUrl = env.NEXT_PUBLIC_SITE_URL;

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Buildipedia',
  description:
    'Architecture services marketplace connecting homeowners with experienced architects.',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@buildipedia.com.au',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Buildipedia',
  url: baseUrl,
  description:
    'Find and book productized architecture services. Compare services from experienced architects with fixed pricing, clear scope, and fast turnaround.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
