import type { Metadata } from 'next';

export const metadata = {
  title: {
    default: 'Buildipedia',
    template: '%s | Buildipedia',
  },
} satisfies Metadata;

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
