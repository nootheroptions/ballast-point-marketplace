import { getUserWithProvider } from '@/actions/users';
import { AppShell } from '@/components/layout/provider-dashboard';

export default async function ProvidersLayout({ children }: { children: React.ReactNode }) {
  const { user, hasProvider, providerSlug } = await getUserWithProvider();

  return (
    <AppShell user={user} hasProvider={hasProvider} providerSlug={providerSlug}>
      {children}
    </AppShell>
  );
}
