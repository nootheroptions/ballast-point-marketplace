import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServiceBySlug } from '@/actions/services';
import { ServiceDetailHeader } from '@/components/marketplace/service/service-detail-header';
import { WhatsIncluded } from '@/components/marketplace/service/whats-included';
import { ClientRequirements } from '@/components/marketplace/service/client-requirements';
import { WhatsNotIncluded } from '@/components/marketplace/service/whats-not-included';
import { ProviderInfo } from '@/components/marketplace/service/provider-info';
import { BookingCard } from '@/components/marketplace/service/booking-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils/format-price';

interface ServiceDetailPageProps {
  params: Promise<{
    providerSlug: string;
    serviceSlug: string;
  }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { providerSlug, serviceSlug } = await params;
  const service = await getServiceBySlug(providerSlug, serviceSlug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const priceFormatted = formatPrice(service.priceCents);

  return {
    title: `${service.name} - ${service.providerProfile.name}`,
    description:
      service.description ||
      `${service.name} by ${service.providerProfile.name}. ${priceFormatted}. ${service.positioning || ''}`,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { providerSlug, serviceSlug } = await params;
  const service = await getServiceBySlug(providerSlug, serviceSlug);

  if (!service) {
    notFound();
  }

  const templateData = service.templateData as Record<string, unknown>;
  const clientResponsibilities = service.clientResponsibilities as string[] | undefined;

  return (
    <div className="bg-background min-h-screen">
      {/* Back navigation */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to search
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column - Scrollable content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Placeholder Image */}
            <div className="bg-muted relative h-64 w-full overflow-hidden rounded-lg md:h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground/40"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <ServiceDetailHeader
              serviceName={service.name}
              providerName={service.providerProfile.name}
              positioning={service.positioning || undefined}
              templateKey={service.templateKey}
            />

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">About This Service</h2>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>

            {/* What's Included */}
            <WhatsIncluded
              templateKey={service.templateKey}
              templateData={templateData}
              coveragePackageKey={service.coveragePackageKey || undefined}
              leadTimeDays={service.leadTimeDays}
              turnaroundDays={service.turnaroundDays}
            />

            {/* What We Need From You */}
            <ClientRequirements
              templateKey={service.templateKey}
              templateData={templateData}
              clientResponsibilities={clientResponsibilities}
              assumptions={service.assumptions || undefined}
            />

            {/* What's NOT Included */}
            <WhatsNotIncluded templateKey={service.templateKey} />

            {/* Provider Info - shown above How It Works on all screen sizes */}
            <ProviderInfo provider={service.providerProfile} />

            {/* Timeline/Process placeholder */}
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">How It Works</h2>
              <div className="bg-muted/50 space-y-4 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Request Booking</h3>
                    <p className="text-muted-foreground text-sm">
                      Submit your project details and any required documents
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Kickoff Meeting</h3>
                    <p className="text-muted-foreground text-sm">
                      Meet with the provider to discuss your vision and requirements
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Delivery</h3>
                    <p className="text-muted-foreground text-sm">
                      Receive your completed service within {service.turnaroundDays} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Pinned booking card */}
          <div className="lg:col-span-1">
            {/* Booking Card - sticky and full height */}
            <BookingCard
              priceCents={service.priceCents}
              leadTimeDays={service.leadTimeDays}
              turnaroundDays={service.turnaroundDays}
              deliveryMode={service.deliveryMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
