import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';
let prisma;
const globalForPrisma = globalThis;
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        log: ['error', 'warn'],
    });
}
else {
    if (!globalForPrisma.__prisma__) {
        globalForPrisma.__prisma__ = new PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    prisma = globalForPrisma.__prisma__;
}
prisma
    .$connect()
    .then(() => logger.info('Connected to database'))
    .catch((err) => {
    logger.error({ err }, 'Failed to connect to database');
});
export { prisma };
