import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserDropdown } from './user-dropdown';

interface HomeHeaderProps {
  user?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string;
  } | null;
  hasProvider?: boolean;
  providerSlug?: string;
}

export function HomeHeader({ user, hasProvider, providerSlug }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-gray-900">Logo</div>
          </Link>

          {/* Navigation */}
          {user ? (
            <UserDropdown
              user={user}
              hasProvider={hasProvider ?? false}
              providerSlug={providerSlug}
            />
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
              >
                Log in
              </Link>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-gray-300 hover:bg-gray-50"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="rounded-full border-gray-300 hover:bg-gray-50"
              >
                <Link href="/providers/onboarding">List your business</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
