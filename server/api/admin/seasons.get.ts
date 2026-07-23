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

  const seasons = await prisma.season.findMany({
    include: {
      teams: {
        include: {
          teamReference: true,
          user: {
            select: {
              id: true,
              username: true,
              fifaNickname: true,
            },
          },
        },
      },
      _count: {
        select: {
          teams: true,
          matches: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return seasons;
});
