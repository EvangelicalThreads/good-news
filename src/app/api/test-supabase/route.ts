import { prisma } from '@/lib/prisma';

export async function GET() {
  const result = await prisma.$queryRaw`SELECT current_user;`;
  console.log('Current user:', result);
  return new Response(JSON.stringify(result));
}
