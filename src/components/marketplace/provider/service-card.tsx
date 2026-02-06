import type { PublicService } from '@/lib/types/public';
import { ServiceCard as SharedServiceCard } from '@/components/marketplace/service-card';

interface ServiceCardProps {
  service: PublicService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return <SharedServiceCard service={service} variant="default" />;
}
