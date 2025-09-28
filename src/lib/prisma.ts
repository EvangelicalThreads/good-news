import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Disable prepared statements explicitly in production
const prismaOptions = {
  errorFormat: 'minimal',
  __internal: {
    engine: {
      enablePreparedStatements: false,
    },
  },
};

export const prisma = global.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
