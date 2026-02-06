import { Service } from '@prisma/client';
import { getServices } from '@/actions/services';
import { getBundles } from '@/actions/bundles';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';
import { BundleWithServices } from '@/lib/repositories/bundle.repo';

export default async function ServicesPage() {
  const [servicesResult, bundlesResult] = await Promise.all([getServices(), getBundles()]);

  if (!servicesResult.success) {
    return (
      <div className="max-w-7xl">
        <ServicesHeader />
        <div className="border-destructive/50 bg-destructive/10 mt-8 rounded-lg border p-6">
          <p className="text-destructive text-sm">{servicesResult.error}</p>
        </div>
      </div>
    );
  }

  const services = (servicesResult.data ?? []) as Service[];
  const bundles = (
    bundlesResult.success ? (bundlesResult.data ?? []) : []
  ) as (BundleWithServices & {
    calculatedPriceCents: number;
  })[];

  return <ServicesPageContent services={services} bundles={bundles} />;
}
