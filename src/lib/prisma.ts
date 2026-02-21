import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { unstable_noStore as noStore } from 'next/cache';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = (() => {
    noStore();
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
    const client = new PrismaClient({ adapter })
    return client;
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
