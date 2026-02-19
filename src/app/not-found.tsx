import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-foreground text-6xl font-bold">404</h1>
        <h2 className="text-foreground mt-4 text-2xl font-semibold">Coming Soon</h2>
        <p className="text-muted-foreground mt-2">
          This page is not available yet. We&apos;re working hard to bring you something great!
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/home">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
