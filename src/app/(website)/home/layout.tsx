import type { Metadata } from 'next';

export const metadata = {
  title: 'For Architects',
  description:
    'Grow your architecture practice with qualified homeowner leads. Showcase services, get discovered, and book consultations on Buildipedia.',
  openGraph: {
    title: 'For Architects | Buildipedia',
    description:
      'Grow your architecture practice with qualified homeowner leads. Showcase services, get discovered, and book consultations on Buildipedia.',
  },
} satisfies Metadata;

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
