import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/config/env';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Login',
  description: 'Sign in to your account',
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
