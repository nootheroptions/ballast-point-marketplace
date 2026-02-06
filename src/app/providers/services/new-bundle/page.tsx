import { Service } from '@prisma/client';
import { getServices } from '@/actions/services';
import { BundleForm } from '@/components/services/bundles/BundleForm';

export default async function NewBundlePage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <div className="max-w-4xl">
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
        <h1 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">New Bundle</h1>
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You need at least 2 services to create a bundle. Please create more services first.
          </p>
        </div>
      </div>
    );
  }

  return <BundleForm services={services} />;
}
