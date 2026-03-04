import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
} satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
