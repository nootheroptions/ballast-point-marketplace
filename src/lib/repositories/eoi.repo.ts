import { prisma } from '@/lib/db/prisma';
import { ExpressionOfInterest, Prisma } from '@prisma/client';

export interface UpsertEoiData {
  email: string;
  name?: string;
}

export interface EoiRepository {
  upsert(data: UpsertEoiData, tx?: Prisma.TransactionClient): Promise<ExpressionOfInterest>;
}

export function createEoiRepository(): EoiRepository {
  return {
    async upsert(
      data: UpsertEoiData,
      tx?: Prisma.TransactionClient
    ): Promise<ExpressionOfInterest> {
      const client = tx ?? prisma;
      return await client.expressionOfInterest.upsert({
        where: { email: data.email },
        update: {
          name: data.name,
        },
        create: {
          email: data.email,
          name: data.name,
        },
      });
    },
  };
}
