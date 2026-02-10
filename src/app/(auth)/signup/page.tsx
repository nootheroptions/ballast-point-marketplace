import { SignUpForm } from '@/components/auth/signup-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { env } from '@/lib/config/env';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
} satisfies Metadata;

function SignUpFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={env.NEXT_PUBLIC_SITE_URL}>
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <Suspense fallback={<SignUpFormSkeleton />}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
