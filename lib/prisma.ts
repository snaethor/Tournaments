import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL is expected to be a file path like "file:./dev.db" or "./dev.db"
const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

const adapter = new PrismaBetterSqlite3({
  url: dbUrl,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
