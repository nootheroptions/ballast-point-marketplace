import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import { MarketplaceServiceForm } from '@/components/services/marketplace/MarketplaceServiceForm';

export const metadata = {
  title: 'New Service',
  description: 'Create a new architecture service to offer on the marketplace.',
} satisfies Metadata;

export default function NewServicePage() {
  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="New Service"
          subtitle="Create a new service to offer on the marketplace"
        />
        <MarketplaceServiceForm />
      </div>
    </PageHeaderProvider>
  );
}
