import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/config/env';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Log In',
  description:
    'Sign in to your Buildipedia account to manage your architecture services or book consultations.',
  robots: {
    index: false,
    follow: true,
  },
} satisfies Metadata;

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={env.NEXT_PUBLIC_SITE_URL}>
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <LoginForm />
    </div>
  );
}
