import type { ProviderProfile, Service, Bundle, ServiceAddOn, BundleAddOn } from '@prisma/client';
import type { ServiceWithProvider, ServiceWithDetails } from '@/lib/repositories/service.repo';
import type { BundleWithServices, BundleWithDetails } from '@/lib/repositories/bundle.repo';
import type {
  PublicProvider,
  PublicService,
  PublicServiceAddOn,
  PublicServiceWithProvider,
  PublicServiceWithDetails,
  PublicBundle,
  PublicBundleWithServices,
  PublicBundleAddOn,
  PublicBundleWithDetails,
} from './public';

/**
 * =============================================================================
 * PUBLIC MAPPERS
 * =============================================================================
 *
 * These functions transform internal Prisma models to public-facing types.
 * They strip out internal fields like relationship IDs and timestamps.
 */

// =============================================================================
// Provider Mappers
// =============================================================================

/**
 * Maps a ProviderProfile to a PublicProvider
 */
export function toPublicProvider(provider: ProviderProfile): PublicProvider {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    description: provider.description,
    logoUrl: provider.logoUrl,
  };
}

// =============================================================================
// Service Mappers
// =============================================================================

/**
 * Maps a Service to a PublicService
 */
export function toPublicService(service: Service): PublicService {
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    templateKey: service.templateKey,
    templateData: service.templateData,
    coveragePackageKey: service.coveragePackageKey,
    priceCents: service.priceCents,
    leadTimeDays: service.leadTimeDays,
    turnaroundDays: service.turnaroundDays,
    deliveryMode: service.deliveryMode,
    positioning: service.positioning,
    assumptions: service.assumptions,
    clientResponsibilities: service.clientResponsibilities,
    slotDuration: service.slotDuration,
    slotBuffer: service.slotBuffer,
    advanceBookingMin: service.advanceBookingMin,
    advanceBookingMax: service.advanceBookingMax,
  };
}

/**
 * Maps a ServiceAddOn to a PublicServiceAddOn
 */
export function toPublicServiceAddOn(addOn: ServiceAddOn): PublicServiceAddOn {
  return {
    addOnKey: addOn.addOnKey,
    priceCents: addOn.priceCents,
    turnaroundImpactDays: addOn.turnaroundImpactDays,
  };
}

/**
 * Maps a ServiceWithProvider to a PublicServiceWithProvider
 */
export function toPublicServiceWithProvider(
  service: ServiceWithProvider
): PublicServiceWithProvider {
  return {
    ...toPublicService(service),
    providerProfile: toPublicProvider(service.providerProfile),
  };
}

/**
 * Maps a ServiceWithDetails to a PublicServiceWithDetails
 */
export function toPublicServiceWithDetails(service: ServiceWithDetails): PublicServiceWithDetails {
  return {
    ...toPublicService(service),
    providerProfile: toPublicProvider(service.providerProfile),
    addOns: service.addOns.map(toPublicServiceAddOn),
  };
}

// =============================================================================
// Bundle Mappers
// =============================================================================

/**
 * Maps a Bundle (with calculatedPriceCents) to a PublicBundle
 */
export function toPublicBundle(bundle: Bundle & { calculatedPriceCents: number }): PublicBundle {
  return {
    id: bundle.id,
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.description,
    pricingType: bundle.pricingType,
    priceCents: bundle.priceCents,
    positioning: bundle.positioning,
    calculatedPriceCents: bundle.calculatedPriceCents,
  };
}

/**
 * Maps a BundleAddOn to a PublicBundleAddOn
 */
export function toPublicBundleAddOn(addOn: BundleAddOn): PublicBundleAddOn {
  return {
    addOnKey: addOn.addOnKey,
    priceCents: addOn.priceCents,
    turnaroundImpactDays: addOn.turnaroundImpactDays,
  };
}

/**
 * Maps a BundleWithServices (with calculatedPriceCents) to a PublicBundleWithServices
 */
export function toPublicBundleWithServices(
  bundle: BundleWithServices & { calculatedPriceCents: number }
): PublicBundleWithServices {
  return {
    ...toPublicBundle(bundle),
    services: bundle.services.map((bs) => ({
      sortOrder: bs.sortOrder,
      service: toPublicService(bs.service),
    })),
  };
}

/**
 * Maps a BundleWithDetails (with calculatedPriceCents) to a PublicBundleWithDetails
 */
export function toPublicBundleWithDetails(
  bundle: BundleWithDetails & { calculatedPriceCents: number }
): PublicBundleWithDetails {
  return {
    ...toPublicBundle(bundle),
    providerProfile: toPublicProvider(bundle.providerProfile),
    services: bundle.services.map((bs) => ({
      sortOrder: bs.sortOrder,
      service: toPublicService(bs.service),
    })),
    addOns: bundle.addOns.map(toPublicBundleAddOn),
  };
}
