import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const prisma = usePrisma();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fifaNickname: true,
      role: true,
      totalPoints: true,
      seasonsPlayed: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
});
