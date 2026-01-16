import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication',
} satisfies Metadata;

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="text-muted-foreground max-w-md">
        There was a problem verifying your email. The link may have expired or already been used.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
        >
          Try signing up again
        </Link>
        <Link
          href="/"
          className="border-input hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
