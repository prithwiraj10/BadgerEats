import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';

let prisma: PrismaClient;

type GlobalWithPrisma = typeof globalThis & {
  __prisma__?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!globalForPrisma.__prisma__) {
    globalForPrisma.__prisma__ = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalForPrisma.__prisma__ as PrismaClient;
}

prisma
  .$connect()
  .then(() => logger.info('Connected to database'))
  .catch((err: unknown) => {
    logger.error({ err }, 'Failed to connect to database');
  });

export { prisma };
