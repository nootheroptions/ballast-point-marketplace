import Link from 'next/link';
import { UserDropdown } from '@/components/home/user-dropdown';

interface ProviderHeaderProps {
  user?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string;
  } | null;
  hasProvider?: boolean;
  providerSlug?: string;
}

export function ProviderHeader({ user, hasProvider, providerSlug }: ProviderHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="text-2xl font-bold text-gray-900">Logo</div>
        </Link>

        {/* Navigation */}
        {user && (
          <UserDropdown
            user={user}
            hasProvider={hasProvider ?? false}
            providerSlug={providerSlug}
          />
        )}
      </div>
    </header>
  );
}
