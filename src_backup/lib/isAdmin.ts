// src/lib/isAdmin.ts
import { prisma } from "@/lib/prisma";

export async function isAdmin(userId: string | undefined) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return !!user?.is_admin;
}
