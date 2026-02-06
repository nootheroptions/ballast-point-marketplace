import { prisma } from '@/lib/db/prisma';
import type { SupportedCountryCodes } from '@/lib/locations';
import { Prisma, ProviderServiceArea } from '@prisma/client';

export interface ProviderServiceAreasRepository {
  getServiceAreas(
    providerProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderServiceArea[]>;

  replaceServiceAreas(
    providerProfileId: string,
    serviceAreas: Array<{
      country: SupportedCountryCodes;
      jurisdiction: string;
      localityName: string;
      localityType?: string;
    }>,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderServiceArea[]>;

  deleteServiceAreasForJurisdictions(
    providerProfileId: string,
    country: SupportedCountryCodes,
    jurisdictionsToRemove: string[],
    tx?: Prisma.TransactionClient
  ): Promise<void>;
}

export function createProviderServiceAreasRepository(): ProviderServiceAreasRepository {
  async function replaceServiceAreasInternal(
    client: Prisma.TransactionClient,
    providerProfileId: string,
    serviceAreas: Array<{
      country: SupportedCountryCodes;
      jurisdiction: string;
      localityName: string;
      localityType?: string;
    }>
  ): Promise<ProviderServiceArea[]> {
    await client.providerServiceArea.deleteMany({
      where: { providerProfileId },
    });

    if (serviceAreas.length > 0) {
      await client.providerServiceArea.createMany({
        data: serviceAreas.map(({ country, jurisdiction, localityName, localityType }) => ({
          providerProfileId,
          country,
          jurisdiction,
          localityName,
          localityType: localityType || null,
        })),
      });
    }

    return client.providerServiceArea.findMany({
      where: { providerProfileId },
      orderBy: [{ country: 'asc' }, { jurisdiction: 'asc' }, { localityName: 'asc' }],
    });
  }

  return {
    async getServiceAreas(
      providerProfileId: string,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderServiceArea[]> {
      const client = tx ?? prisma;
      return client.providerServiceArea.findMany({
        where: { providerProfileId },
        orderBy: [{ country: 'asc' }, { jurisdiction: 'asc' }, { localityName: 'asc' }],
      });
    },

    async replaceServiceAreas(
      providerProfileId: string,
      serviceAreas: Array<{
        country: SupportedCountryCodes;
        jurisdiction: string;
        localityName: string;
        localityType?: string;
      }>,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderServiceArea[]> {
      if (tx) {
        return replaceServiceAreasInternal(tx, providerProfileId, serviceAreas);
      }

      return prisma.$transaction((transactionClient) =>
        replaceServiceAreasInternal(transactionClient, providerProfileId, serviceAreas)
      );
    },

    async deleteServiceAreasForJurisdictions(
      providerProfileId: string,
      country: SupportedCountryCodes,
      jurisdictionsToRemove: string[],
      tx?: Prisma.TransactionClient
    ): Promise<void> {
      if (jurisdictionsToRemove.length === 0) return;

      const client = tx ?? prisma;
      await client.providerServiceArea.deleteMany({
        where: {
          providerProfileId,
          country,
          jurisdiction: { in: jurisdictionsToRemove },
        },
      });
    },
  };
}
