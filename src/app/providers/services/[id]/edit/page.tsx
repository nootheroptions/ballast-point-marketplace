import { notFound } from 'next/navigation';
import { Service } from '@prisma/client';
import { getServiceById } from '@/actions/services';
import { MarketplaceServiceForm } from '@/components/services/marketplace/MarketplaceServiceForm';

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
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
