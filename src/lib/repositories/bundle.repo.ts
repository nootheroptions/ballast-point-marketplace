import { prisma } from '@/lib/db/prisma';
import { Prisma, Bundle, BundlePricingType } from '@prisma/client';

/**
 * Bundle with services included
 */
export type BundleWithServices = Prisma.BundleGetPayload<{
  include: {
    services: {
      include: {
        service: true;
      };
      orderBy: {
        sortOrder: 'asc';
      };
    };
  };
}>;

/**
 * Bundle with provider profile included
 */
export type BundleWithProvider = Prisma.BundleGetPayload<{
  include: { providerProfile: true };
}>;

/**
 * Bundle with full details for detail page
 */
export type BundleWithDetails = Prisma.BundleGetPayload<{
  include: {
    providerProfile: true;
    services: {
      include: {
        service: true;
      };
      orderBy: {
        sortOrder: 'asc';
      };
    };
    addOns: true;
  };
}>;

export type CreateBundleData = {
  name: string;
  slug: string;
  description: string;
  providerProfileId: string;
  isPublished: boolean;
  pricingType: BundlePricingType;
  priceCents: number;
  positioning?: string;
  services: Array<{
    serviceId: string;
    sortOrder: number;
  }>;
};

export type UpdateBundleData = {
  name?: string;
  slug?: string;
  description?: string;
  pricingType?: BundlePricingType;
  priceCents?: number;
  positioning?: string | null;
  isPublished?: boolean;
  services?: Array<{
    serviceId: string;
    sortOrder: number;
  }>;
};

/**
 * Bundle repository abstraction
 */
export interface BundleRepository {
  findById(id: string, tx?: Prisma.TransactionClient): Promise<Bundle | null>;
  findByIdWithServices(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<BundleWithServices | null>;
  findByProviderProfileId(
    providerProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<BundleWithServices[]>;
  findByProviderAndSlug(
    providerProfileId: string,
    slug: string,
    tx?: Prisma.TransactionClient
  ): Promise<Bundle | null>;
  create(data: CreateBundleData, tx?: Prisma.TransactionClient): Promise<BundleWithServices>;
  update(
    id: string,
    data: UpdateBundleData,
    tx?: Prisma.TransactionClient
  ): Promise<BundleWithServices>;
  delete(id: string, tx?: Prisma.TransactionClient): Promise<Bundle>;
  findPublishedBundles(tx?: Prisma.TransactionClient): Promise<BundleWithProvider[]>;
  findPublishedBySlug(
    providerSlug: string,
    bundleSlug: string,
    tx?: Prisma.TransactionClient
  ): Promise<BundleWithDetails | null>;
  findPublishedByProviderSlug(
    providerSlug: string,
    tx?: Prisma.TransactionClient
  ): Promise<BundleWithServices[]>;
  /**
   * Calculate the total price of a bundle based on its services
   * Used when pricing type is SUM_OF_PARTS
   */
  calculateSumOfPartsPriceCents(bundleId: string, tx?: Prisma.TransactionClient): Promise<number>;
}

/**
 * Creates a Prisma-based Bundle repository
 */
export function createBundleRepository(): BundleRepository {
  return {
    async findById(id: string, tx?: Prisma.TransactionClient): Promise<Bundle | null> {
      const client = tx ?? prisma;
      return await client.bundle.findUnique({
        where: { id },
      });
    },

    async findByIdWithServices(
      id: string,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithServices | null> {
      const client = tx ?? prisma;
      return await client.bundle.findUnique({
        where: { id },
        include: {
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    },

    async findByProviderProfileId(
      providerProfileId: string,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithServices[]> {
      const client = tx ?? prisma;
      return await client.bundle.findMany({
        where: { providerProfileId },
        include: {
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    async findByProviderAndSlug(
      providerProfileId: string,
      slug: string,
      tx?: Prisma.TransactionClient
    ): Promise<Bundle | null> {
      const client = tx ?? prisma;
      return await client.bundle.findUnique({
        where: {
          providerProfileId_slug: {
            providerProfileId,
            slug,
          },
        },
      });
    },

    async create(
      data: CreateBundleData,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithServices> {
      const client = tx ?? prisma;

      return await client.bundle.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          providerProfile: {
            connect: {
              id: data.providerProfileId,
            },
          },
          isPublished: data.isPublished,
          pricingType: data.pricingType,
          priceCents: data.priceCents,
          positioning: data.positioning,
          services: {
            create: data.services.map((s) => ({
              serviceId: s.serviceId,
              sortOrder: s.sortOrder,
            })),
          },
        },
        include: {
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    },

    async update(
      id: string,
      data: UpdateBundleData,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithServices> {
      const client = tx ?? prisma;

      // If services are being updated, delete old ones first
      if (data.services) {
        await client.bundleService.deleteMany({
          where: { bundleId: id },
        });
      }

      return await client.bundle.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.pricingType !== undefined && { pricingType: data.pricingType }),
          ...(data.priceCents !== undefined && { priceCents: data.priceCents }),
          ...(data.positioning !== undefined && { positioning: data.positioning }),
          ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
          ...(data.services && {
            services: {
              create: data.services.map((s) => ({
                serviceId: s.serviceId,
                sortOrder: s.sortOrder,
              })),
            },
          }),
        },
        include: {
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    },

    async delete(id: string, tx?: Prisma.TransactionClient): Promise<Bundle> {
      const client = tx ?? prisma;
      return await client.bundle.delete({
        where: { id },
      });
    },

    async findPublishedBundles(tx?: Prisma.TransactionClient): Promise<BundleWithProvider[]> {
      const client = tx ?? prisma;
      return await client.bundle.findMany({
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
      bundleSlug: string,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithDetails | null> {
      const client = tx ?? prisma;
      return await client.bundle.findFirst({
        where: {
          slug: bundleSlug,
          isPublished: true,
          providerProfile: {
            slug: providerSlug,
          },
        },
        include: {
          providerProfile: true,
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
          addOns: true,
        },
      });
    },

    async findPublishedByProviderSlug(
      providerSlug: string,
      tx?: Prisma.TransactionClient
    ): Promise<BundleWithServices[]> {
      const client = tx ?? prisma;
      return await client.bundle.findMany({
        where: {
          isPublished: true,
          providerProfile: {
            slug: providerSlug,
          },
        },
        include: {
          services: {
            include: {
              service: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    async calculateSumOfPartsPriceCents(
      bundleId: string,
      tx?: Prisma.TransactionClient
    ): Promise<number> {
      const client = tx ?? prisma;

      const bundleServices = await client.bundleService.findMany({
        where: { bundleId },
        include: {
          service: {
            select: {
              priceCents: true,
            },
          },
        },
      });

      return bundleServices.reduce((sum, bs) => sum + bs.service.priceCents, 0);
    },
  };
}
