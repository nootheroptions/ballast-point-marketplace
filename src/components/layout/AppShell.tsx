import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex">
        <Sidebar />
      </aside>

      {/* Mobile header with hamburger menu */}
      <div className="fixed inset-x-0 top-0 z-50 lg:hidden">
        <MobileHeader />
      </div>

      {/* Main content - offset for sidebar on desktop, header on mobile */}
      <main className="flex-1 pt-14 lg:pt-0 lg:pl-16">{children}</main>
    </div>
  );
}
