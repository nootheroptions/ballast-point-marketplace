import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Service } from '@prisma/client';
import { getServiceById } from '@/actions/services';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import {
  MarketplaceServiceForm,
  MarketplaceServiceFormSkeleton,
} from '@/components/services/marketplace/MarketplaceServiceForm';

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;

  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="Edit Service"
          subtitle="Update your service details, pricing, and availability settings"
        />
        <Suspense fallback={<MarketplaceServiceFormSkeleton />}>
          <EditServiceContent id={id} />
        </Suspense>
      </div>
    </PageHeaderProvider>
  );
}

async function EditServiceContent({ id }: { id: string }) {
  const result = await getServiceById({ id });

  if (!result.success) {
    notFound();
  }

  const service = result.data as Service;
  if (!service) {
    notFound();
  }

  return <MarketplaceServiceForm service={service} />;
}
