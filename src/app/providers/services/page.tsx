import { Service } from '@prisma/client';
import { getServices } from '@/actions/services';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';

export default async function ServicesPage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <div className="max-w-7xl">
        <ServicesHeader />
        <div className="border-destructive/50 bg-destructive/10 mt-8 rounded-lg border p-6">
          <p className="text-destructive text-sm">{result.error}</p>
        </div>
      </div>
    );
  }

  const services = (result.data ?? []) as Service[];

  return <ServicesPageContent services={services} />;
}
