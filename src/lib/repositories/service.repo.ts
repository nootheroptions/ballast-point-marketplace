import { prisma } from '@/lib/db/prisma';
import { Prisma, Service, TemplateKey, DeliveryMode } from '@prisma/client';

/**
 * Service with provider profile included
 */
export type ServiceWithProvider = Prisma.ServiceGetPayload<{
  include: { providerProfile: true };
}>;

/**
 * Service with full details for detail page
 */
export type ServiceWithDetails = Prisma.ServiceGetPayload<{
  include: {
    providerProfile: true;
    addOns: true;
  };
}>;

export type CreateServiceData = {
  // Basic fields
  name: string;
  slug: string;
  description: string;
  providerProfileId: string;

  // Marketplace fields (required for marketplace services)
  templateKey: TemplateKey;
  templateData: Record<string, unknown>;
  coveragePackageKey: string;
  priceCents: number;
  leadTimeDays: number;
  turnaroundDays: number;
  deliveryMode: DeliveryMode;

  // Optional marketplace fields
  positioning?: string;
  assumptions?: string;
  clientResponsibilities?: string[];
  addOns?: Array<{
    addOnKey: string;
    priceCents: number;
    turnaroundImpactDays: number;
  }>;

  // Booking fields (required for marketplace services to be bookable)
  slotDuration: number;
  slotBuffer: number;
  advanceBookingMin: number;
  advanceBookingMax: number;
};

/**
 * Data for updating a service
 */
export interface UpdateServiceData {
  name?: string;
  slug?: string;
  description?: string;

  // Marketplace fields
  templateKey?: TemplateKey;
  templateData?: Record<string, unknown>;
  coveragePackageKey?: string;
  priceCents?: number;
  leadTimeDays?: number;
  turnaroundDays?: number;
  deliveryMode?: DeliveryMode;
  positioning?: string;
  assumptions?: string;
  clientResponsibilities?: string[];
  isPublished?: boolean;

  // Add-ons (if provided, will replace all existing add-ons)
  addOns?: Array<{
    addOnKey: string;
    priceCents: number;
    turnaroundImpactDays: number;
  }>;

  // Booking fields
  slotDuration?: number;
  slotBuffer?: number;
  advanceBookingMin?: number;
  advanceBookingMax?: number;
}

/**
 * Service repository abstraction
 * Encapsulates database operations for services
 */
export interface ServiceRepository {
  /**
   * Find a service by ID
   * @param id - The service ID
   * @param tx - Optional transaction client
   * @returns The service if exists, null otherwise
   */
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Service | null>;

  /**
   * Find all services for a provider profile
   * @param providerProfileId - The provider profile ID
   * @param tx - Optional transaction client
   * @returns Array of services
   */
  findByProviderProfileId(
    providerProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<Service[]>;

  /**
   * Find a service by slug within a provider
   * @param providerProfileId - The provider profile ID
   * @param slug - The service slug
   * @param tx - Optional transaction client
   * @returns The service if exists, null otherwise
   */
  findByProviderAndSlug(
    providerProfileId: string,
    slug: string,
    tx?: Prisma.TransactionClient
  ): Promise<Service | null>;

  /**
   * Create a new service
   * @param data - The service data
   * @param tx - Optional transaction client
   * @returns The created service
   */
  create(data: CreateServiceData, tx?: Prisma.TransactionClient): Promise<Service>;

  /**
   * Update a service
   * @param id - The service ID
   * @param data - The data to update
   * @param tx - Optional transaction client
   * @returns The updated service
   */
  update(id: string, data: UpdateServiceData, tx?: Prisma.TransactionClient): Promise<Service>;

  /**
   * Delete a service
   * @param id - The service ID
   * @param tx - Optional transaction client
   * @returns The deleted service
   */
  delete(id: string, tx?: Prisma.TransactionClient): Promise<Service>;

  /**
   * Find all published marketplace services
   * @param tx - Optional transaction client
   * @returns Array of published services with provider profile
   */
  findPublishedServices(tx?: Prisma.TransactionClient): Promise<ServiceWithProvider[]>;

  /**
   * Find a published service by provider slug and service slug with full details
   * @param providerSlug - The provider slug
   * @param serviceSlug - The service slug
   * @param tx - Optional transaction client
   * @returns The service with full details if exists and published, null otherwise
   */
  findPublishedBySlug(
    providerSlug: string,
    serviceSlug: string,
    tx?: Prisma.TransactionClient
  ): Promise<ServiceWithDetails | null>;
}

/**
 * Creates a Prisma-based Service repository
 * @returns ServiceRepository implementation
 */
export function createServiceRepository(): ServiceRepository {
  return {
    async findById(id: string, tx?: Prisma.TransactionClient): Promise<Service | null> {
      const client = tx ?? prisma;
      return await client.service.findUnique({
        where: { id },
      });
    },

    async findByProviderProfileId(
      providerProfileId: string,
      tx?: Prisma.TransactionClient
    ): Promise<Service[]> {
      const client = tx ?? prisma;
      return await client.service.findMany({
        where: { providerProfileId },
        orderBy: { createdAt: 'desc' },
      });
    },

    async findByProviderAndSlug(
      providerProfileId: string,
      slug: string,
      tx?: Prisma.TransactionClient
    ): Promise<Service | null> {
      const client = tx ?? prisma;
      return await client.service.findUnique({
        where: {
          providerProfileId_slug: {
            providerProfileId,
            slug,
          },
        },
      });
    },

    async create(data: CreateServiceData, tx?: Prisma.TransactionClient): Promise<Service> {
      const client = tx ?? prisma;

      return await client.service.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          providerProfile: {
            connect: {
              id: data.providerProfileId,
            },
          },
          // Marketplace fields (required)
          templateKey: data.templateKey,
          templateData: data.templateData as Prisma.InputJsonValue,
          coveragePackageKey: data.coveragePackageKey,
          priceCents: data.priceCents,
          leadTimeDays: data.leadTimeDays,
          turnaroundDays: data.turnaroundDays,
          deliveryMode: data.deliveryMode,
          // Optional marketplace fields
          positioning: data.positioning,
          assumptions: data.assumptions,
          clientResponsibilities: data.clientResponsibilities as Prisma.InputJsonValue,
          // Booking fields (required for marketplace services)
          slotDuration: data.slotDuration,
          slotBuffer: data.slotBuffer,
          advanceBookingMin: data.advanceBookingMin,
          advanceBookingMax: data.advanceBookingMax,
          // Create add-ons if provided
          ...(data.addOns && data.addOns.length > 0
            ? {
                addOns: {
                  create: data.addOns.map((addOn) => ({
                    addOnKey: addOn.addOnKey,
                    priceCents: addOn.priceCents,
                    turnaroundImpactDays: addOn.turnaroundImpactDays,
                  })),
                },
              }
            : {}),
        },
        include: {
          addOns: true,
        },
      });
    },

    async update(
      id: string,
      data: UpdateServiceData,
      tx?: Prisma.TransactionClient
    ): Promise<Service> {
      const client = tx ?? prisma;

      // If add-ons are being updated, we need to delete old ones and create new ones
      if (data.addOns) {
        await client.serviceAddOn.deleteMany({
          where: { serviceId: id },
        });
      }

      return await client.service.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          // Marketplace fields
          ...(data.templateKey !== undefined && { templateKey: data.templateKey }),
          ...(data.templateData !== undefined && {
            templateData: data.templateData as Prisma.InputJsonValue,
          }),
          ...(data.coveragePackageKey !== undefined && {
            coveragePackageKey: data.coveragePackageKey,
          }),
          ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
          ...(data.leadTimeDays !== undefined && { leadTimeDays: data.leadTimeDays }),
          ...(data.turnaroundDays !== undefined && { turnaroundDays: data.turnaroundDays }),
          ...(data.deliveryMode !== undefined && { deliveryMode: data.deliveryMode }),
          ...(data.positioning !== undefined && { positioning: data.positioning }),
          ...(data.assumptions !== undefined && { assumptions: data.assumptions }),
          ...(data.clientResponsibilities !== undefined && {
            clientResponsibilities: data.clientResponsibilities as Prisma.InputJsonValue,
          }),
          ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
          // Booking fields
          ...(data.slotDuration !== undefined && { slotDuration: data.slotDuration }),
          ...(data.slotBuffer !== undefined && { slotBuffer: data.slotBuffer }),
          ...(data.advanceBookingMin !== undefined && {
            advanceBookingMin: data.advanceBookingMin,
          }),
          ...(data.advanceBookingMax !== undefined && {
            advanceBookingMax: data.advanceBookingMax,
          }),
          // Create new add-ons if provided
          ...(data.addOns && data.addOns.length > 0
            ? {
                addOns: {
                  create: data.addOns.map((addOn) => ({
                    addOnKey: addOn.addOnKey,
                    priceCents: addOn.priceCents,
                    turnaroundImpactDays: addOn.turnaroundImpactDays,
                  })),
                },
              }
            : {}),
        },
        include: {
          addOns: true,
        },
      });
    },

    async delete(id: string, tx?: Prisma.TransactionClient): Promise<Service> {
      const client = tx ?? prisma;
      return await client.service.delete({
        where: { id },
      });
    },

    async findPublishedServices(tx?: Prisma.TransactionClient): Promise<ServiceWithProvider[]> {
      const client = tx ?? prisma;
      return await client.service.findMany({
        where: {
          isPublished: true,
        },
        include: {
          providerProfile: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    async findPublishedBySlug(
      providerSlug: string,
      serviceSlug: string,
      tx?: Prisma.TransactionClient
    ): Promise<ServiceWithDetails | null> {
      const client = tx ?? prisma;
      return await client.service.findFirst({
        where: {
          slug: serviceSlug,
          isPublished: true,
          providerProfile: {
            slug: providerSlug,
          },
        },
        include: {
          providerProfile: true,
          addOns: true,
        },
      });
    },
  };
}
