'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Services page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-8">
        <div className="mb-4 flex items-center gap-3">
          <AlertCircle className="text-destructive h-6 w-6" />
          <h2 className="text-destructive text-lg font-semibold">Something went wrong</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          We encountered an error while loading your services. Please try again.
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
