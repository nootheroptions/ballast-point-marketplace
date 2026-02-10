import type { DeliveryMode, TemplateKey, BundlePricingType } from '@prisma/client';

/**
 * =============================================================================
 * PUBLIC TYPES
 * =============================================================================
 *
 * These types represent the data that is safe to expose to the public.
 * Internal fields like relationship IDs (providerProfileId, teamId) and
 * timestamps are excluded.
 *
 * IMPORTANT: When adding new fields to Prisma models, consider whether they
 * should be exposed publicly. Only add fields to these types if they are
 * intended for public consumption.
 */

// =============================================================================
// Provider Types
// =============================================================================

/**
 * Public-facing provider profile data
 * Excludes: teamId, createdAt, updatedAt
 */
export interface PublicProvider {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  profileUrl: string | null;
  imageUrls: string[];
}

// =============================================================================
// Service Types
// =============================================================================

/**
 * Public-facing service data
 * Excludes: providerProfileId, createdAt, updatedAt, isPublished
 */
export interface PublicService {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrls: string[];
  templateKey: TemplateKey;
  templateData: unknown;
  coveragePackageKey: string | null;
  priceCents: number;
  leadTimeDays: number;
  turnaroundDays: number;
  deliveryMode: DeliveryMode;
  positioning: string | null;
  assumptions: string | null;
  clientResponsibilities: unknown;
  // Booking/scheduling fields (needed for booking flow)
  slotDuration: number;
  slotBuffer: number;
  advanceBookingMin: number;
  advanceBookingMax: number;
}

/**
 * Public-facing service add-on data
 * Excludes: id, serviceId, createdAt, updatedAt
 */
export interface PublicServiceAddOn {
  addOnKey: string;
  priceCents: number;
  turnaroundImpactDays: number;
}

/**
 * Public-facing service with provider info
 * For marketplace listing pages
 */
export interface PublicServiceWithProvider extends PublicService {
  providerProfile: PublicProvider;
}

/**
 * Public-facing service with full details
 * For service detail pages
 */
export interface PublicServiceWithDetails extends PublicService {
  providerProfile: PublicProvider;
  addOns: PublicServiceAddOn[];
}

// =============================================================================
// Bundle Types
// =============================================================================

/**
 * Public-facing bundle data
 * Excludes: providerProfileId, createdAt, updatedAt, isPublished
 */
export interface PublicBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricingType: BundlePricingType;
  priceCents: number;
  positioning: string | null;
  /** Calculated price (for SUM_OF_PARTS, this is the total of all services) */
  calculatedPriceCents: number;
}

/**
 * Public-facing bundle service entry
 * Excludes: id, bundleId, serviceId, createdAt, updatedAt
 */
export interface PublicBundleServiceEntry {
  sortOrder: number;
  service: PublicService;
}

/**
 * Public-facing bundle with services
 * For bundle listing and detail pages
 */
export interface PublicBundleWithServices extends PublicBundle {
  services: PublicBundleServiceEntry[];
}

/**
 * Public-facing bundle add-on
 * Excludes: id, bundleId, createdAt, updatedAt
 */
export interface PublicBundleAddOn {
  addOnKey: string;
  priceCents: number;
  turnaroundImpactDays: number;
}

/**
 * Public-facing bundle with full details
 * For bundle detail pages
 */
export interface PublicBundleWithDetails extends PublicBundle {
  providerProfile: PublicProvider;
  services: PublicBundleServiceEntry[];
  addOns: PublicBundleAddOn[];
}
