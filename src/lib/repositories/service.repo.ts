import { prisma } from '@/lib/db/prisma';
import { Prisma, Service } from '@prisma/client';

/**
 * Data required to create a service
 */
export interface CreateServiceData {
  name: string;
  description: string;
  providerProfileId: string;
}

/**
 * Data for updating a service
 */
export interface UpdateServiceData {
  name?: string;
  description?: string;
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

    async create(data: CreateServiceData, tx?: Prisma.TransactionClient): Promise<Service> {
      const client = tx ?? prisma;
      return await client.service.create({
        data: {
          name: data.name,
          description: data.description,
          providerProfile: {
            connect: {
              id: data.providerProfileId,
            },
          },
        },
      });
    },

    async update(
      id: string,
      data: UpdateServiceData,
      tx?: Prisma.TransactionClient
    ): Promise<Service> {
      const client = tx ?? prisma;
      return await client.service.update({
        where: { id },
        data,
      });
    },

    async delete(id: string, tx?: Prisma.TransactionClient): Promise<Service> {
      const client = tx ?? prisma;
      return await client.service.delete({
        where: { id },
      });
    },
  };
}
