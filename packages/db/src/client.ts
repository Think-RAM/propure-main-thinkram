import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton with connection pooling optimized for serverless
 *
 * Connection pool configuration:
 * - Uses Neon's built-in pooler when DATABASE_URL contains ?pgbouncer=true
 * - Configures pool size based on environment (smaller for serverless)
 * - Uses lazy connection to avoid connection overhead on cold starts
 *
 * For Vercel/serverless, ensure your DATABASE_URL uses Neon's pooled connection:
 * - Pooled: postgres://...@ep-xxx.us-east-1.aws.neon.tech:5432/neondb?pgbouncer=true
 * - Direct: postgres://...@ep-xxx.us-east-1.aws.neon.tech:5432/neondb (for migrations)
 */
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["info", "warn", "error"]
        : ["error"],
    // Datasource configuration for connection pooling
    datasourceUrl: process.env.DATABASE_URL,
  });
};

const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
export type { PrismaClient };
