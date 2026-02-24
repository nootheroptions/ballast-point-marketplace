import { Service } from '@prisma/client';
import { getServices } from '@/actions/services';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import { BundleForm } from '@/components/services/bundles/BundleForm';

export default async function NewBundlePage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <div className="max-w-4xl">
        <PageHeader
          title="New Bundle"
          subtitle="Combine multiple services into a discounted package"
        />
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6">
          <p className="text-destructive text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const services = (result.data ?? []) as Service[];

  // If no services exist, redirect to create a service first
  if (services.length < 2) {
    return (
      <div className="max-w-4xl">
        <PageHeader
          title="New Bundle"
          subtitle="Combine multiple services into a discounted package"
        />
        <div className="border-warning/50 bg-warning/10 rounded-lg border p-6">
          <p className="text-warning text-sm">
            You need at least 2 services to create a bundle. Please create more services first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="New Bundle"
          subtitle="Combine multiple services into a discounted package"
        />
        <BundleForm services={services} />
      </div>
    </PageHeaderProvider>
  );
}
