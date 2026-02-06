import { notFound } from 'next/navigation';
import { Service } from '@prisma/client';
import { getBundleById } from '@/actions/bundles';
import { getServices } from '@/actions/services';
import { PageHeader } from '@/components/layout/provider-dashboard/PageHeader';
import { PageHeaderProvider } from '@/components/layout/provider-dashboard/PageHeaderContext';
import { BundleForm } from '@/components/services/bundles/BundleForm';
import { BundleWithServices } from '@/lib/repositories/bundle.repo';

interface EditBundlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBundlePage({ params }: EditBundlePageProps) {
  const { id } = await params;

  const [bundleResult, servicesResult] = await Promise.all([getBundleById({ id }), getServices()]);

  if (!bundleResult.success) {
    notFound();
  }

  const bundle = bundleResult.data as BundleWithServices & { calculatedPriceCents: number };
  if (!bundle) {
    notFound();
  }

  const services = (servicesResult.success ? (servicesResult.data ?? []) : []) as Service[];

  return (
    <PageHeaderProvider>
      <div className="max-w-4xl">
        <PageHeader
          title="Edit Bundle"
          subtitle="Update your bundle details and included services"
        />
        <BundleForm bundle={bundle} services={services} />
      </div>
    </PageHeaderProvider>
  );
}
