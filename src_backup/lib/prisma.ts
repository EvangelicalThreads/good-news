import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Only create one Prisma client instance
// in development to avoid multiple prepared statements
export const prisma =
  global.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
