import { MobileHeader } from './MobileHeader';
import { ProviderHeader } from './ProviderHeader';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    email: string;
  } | null;
  hasProvider?: boolean;
  providerSlug?: string;
}

export function AppShell({ children, user, hasProvider, providerSlug }: AppShellProps) {
  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex">
        <Sidebar hasProvider={hasProvider} />
      </aside>

      {/* Mobile header with hamburger menu */}
      <div className="fixed inset-x-0 top-0 z-50 lg:hidden">
        <MobileHeader hasProvider={hasProvider} />
      </div>

      {/* Provider header - shown on desktop only */}
      <div className="hidden lg:block">
        <ProviderHeader user={user} hasProvider={hasProvider} providerSlug={providerSlug} />
      </div>

      {/* Main content - offset for sidebar on desktop, header on mobile */}
      <main className="flex-1 pt-14 lg:pt-16 lg:pl-16">
        <div className="px-6 pt-6 pb-6 lg:px-8 lg:pt-4 lg:pb-8">{children}</div>
      </main>
    </div>
  );
}
