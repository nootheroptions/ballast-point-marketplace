'use client';

import { logout } from '@/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { env } from '@/lib/config/env';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserDropdownProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string;
  };
  hasProvider: boolean;
  providerSlug?: string;
}

export function UserDropdown({ user, hasProvider, providerSlug }: UserDropdownProps) {
  const router = useRouter();

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user.email;

  const avatarFallback = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2">
        <Avatar size="lg">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
          <AvatarFallback className="bg-white font-medium text-gray-900">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{displayName}</p>
            <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">Your profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">Your bookings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {hasProvider ? (
          <DropdownMenuItem asChild>
            <Link href={env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}>Your businesses</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={`${env.NEXT_PUBLIC_PROVIDER_DASHBOARD_URL}/onboarding`}>
              List your business
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
