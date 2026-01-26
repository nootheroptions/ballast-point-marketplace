import { Service } from '@prisma/client';
import { getServices } from '@/actions/services';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { ServiceList } from '@/components/services/ServiceList';

export default async function ServicesPage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ServicesHeader />
        <div className="border-destructive/50 bg-destructive/10 mt-8 rounded-lg border p-6">
          <p className="text-destructive text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const services = (result.data ?? []) as Service[];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <ServicesHeader />
      <ServiceList services={services} />
    </div>
  );
}
