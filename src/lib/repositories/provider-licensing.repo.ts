import { prisma } from '@/lib/db/prisma';
import type { SupportedCountryCodes } from '@/lib/locations';
import { Prisma, ProviderLicense, ProviderLocalExperience } from '@prisma/client';

/**
 * ProviderLicensing repository abstraction
 */
export interface ProviderLicensingRepository {
  /**
   * Get licenses for a provider
   */
  getLicenses(providerProfileId: string, tx?: Prisma.TransactionClient): Promise<ProviderLicense[]>;

  /**
   * Get local experience for a provider
   */
  getLocalExperience(
    providerProfileId: string,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderLocalExperience[]>;

  /**
   * Replace all licenses for a provider in a country
   */
  replaceLicenses(
    providerProfileId: string,
    country: SupportedCountryCodes,
    jurisdictions: string[],
    tx?: Prisma.TransactionClient
  ): Promise<ProviderLicense[]>;

  /**
   * Replace all local experience for a provider
   */
  replaceLocalExperience(
    providerProfileId: string,
    localities: Array<{
      country: SupportedCountryCodes;
      jurisdiction: string;
      localityName: string;
      localityType?: string;
    }>,
    tx?: Prisma.TransactionClient
  ): Promise<ProviderLocalExperience[]>;

  /**
   * Deactivate local experience for jurisdictions that are no longer licensed
   */
  deactivateLocalExperienceForJurisdictions(
    providerProfileId: string,
    country: SupportedCountryCodes,
    jurisdictionsToDeactivate: string[],
    tx?: Prisma.TransactionClient
  ): Promise<void>;
}

/**
 * Creates a Prisma-based ProviderLicensing repository
 */
export function createProviderLicensingRepository(): ProviderLicensingRepository {
  return {
    async getLicenses(
      providerProfileId: string,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderLicense[]> {
      const client = tx ?? prisma;
      return client.providerLicense.findMany({
        where: { providerProfileId },
        orderBy: [{ country: 'asc' }, { jurisdiction: 'asc' }],
      });
    },

    async getLocalExperience(
      providerProfileId: string,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderLocalExperience[]> {
      const client = tx ?? prisma;
      return client.providerLocalExperience.findMany({
        where: { providerProfileId },
        orderBy: [{ country: 'asc' }, { jurisdiction: 'asc' }, { localityName: 'asc' }],
      });
    },

    async replaceLicenses(
      providerProfileId: string,
      country: SupportedCountryCodes,
      jurisdictions: string[],
      tx?: Prisma.TransactionClient
    ): Promise<ProviderLicense[]> {
      const client = tx ?? prisma;

      // Delete existing licenses for this country
      await client.providerLicense.deleteMany({
        where: { providerProfileId, country },
      });

      if (jurisdictions.length === 0) {
        return [];
      }

      // Create new licenses
      await client.providerLicense.createMany({
        data: jurisdictions.map((jurisdiction) => ({
          providerProfileId,
          country,
          jurisdiction,
        })),
      });

      return client.providerLicense.findMany({
        where: { providerProfileId, country },
        orderBy: { jurisdiction: 'asc' },
      });
    },

    async replaceLocalExperience(
      providerProfileId: string,
      localities: Array<{
        country: SupportedCountryCodes;
        jurisdiction: string;
        localityName: string;
        localityType?: string;
      }>,
      tx?: Prisma.TransactionClient
    ): Promise<ProviderLocalExperience[]> {
      const client = tx ?? prisma;

      // Get existing local experience
      const existing = await client.providerLocalExperience.findMany({
        where: { providerProfileId },
      });

      const buildKey = (loc: {
        country: string;
        jurisdiction: string;
        localityName: string;
      }): string => `${loc.country}-${loc.jurisdiction}-${loc.localityName}`;

      const existingMap = new Map(
        existing.map(
          (e) =>
            [
              buildKey({
                country: e.country,
                jurisdiction: e.jurisdiction,
                localityName: e.localityName,
              }),
              e,
            ] as const
        )
      );
      const newKeys = new Set(
        localities.map((l) =>
          buildKey({
            country: l.country,
            jurisdiction: l.jurisdiction,
            localityName: l.localityName,
          })
        )
      );

      // Deactivate localities being removed
      const toDeactivate = existing.filter(
        (e) =>
          !newKeys.has(
            buildKey({
              country: e.country,
              jurisdiction: e.jurisdiction,
              localityName: e.localityName,
            })
          )
      );
      if (toDeactivate.length > 0) {
        await client.providerLocalExperience.updateMany({
          where: {
            providerProfileId,
            id: { in: toDeactivate.map((e) => e.id) },
          },
          data: { isActive: false },
        });
      }

      // Activate localities that already exist
      const toActivate = localities.filter((l) =>
        existingMap.has(
          buildKey({
            country: l.country,
            jurisdiction: l.jurisdiction,
            localityName: l.localityName,
          })
        )
      );
      if (toActivate.length > 0) {
        await client.providerLocalExperience.updateMany({
          where: {
            providerProfileId,
            OR: toActivate.map((l) => ({
              country: l.country,
              jurisdiction: l.jurisdiction,
              localityName: l.localityName,
            })),
          },
          data: { isActive: true },
        });
      }

      // Create new localities
      const toCreate = localities.filter(
        (l) =>
          !existingMap.has(
            buildKey({
              country: l.country,
              jurisdiction: l.jurisdiction,
              localityName: l.localityName,
            })
          )
      );
      if (toCreate.length > 0) {
        await client.providerLocalExperience.createMany({
          data: toCreate.map(({ country, jurisdiction, localityName, localityType }) => ({
            providerProfileId,
            country,
            jurisdiction,
            localityName,
            localityType,
            isActive: true,
          })),
        });
      }

      return client.providerLocalExperience.findMany({
        where: { providerProfileId, isActive: true },
        orderBy: [{ country: 'asc' }, { jurisdiction: 'asc' }, { localityName: 'asc' }],
      });
    },

    async deactivateLocalExperienceForJurisdictions(
      providerProfileId: string,
      country: SupportedCountryCodes,
      jurisdictionsToDeactivate: string[],
      tx?: Prisma.TransactionClient
    ): Promise<void> {
      if (jurisdictionsToDeactivate.length === 0) return;

      const client = tx ?? prisma;
      await client.providerLocalExperience.updateMany({
        where: {
          providerProfileId,
          country,
          jurisdiction: { in: jurisdictionsToDeactivate },
        },
        data: { isActive: false },
      });
    },
  };
}
