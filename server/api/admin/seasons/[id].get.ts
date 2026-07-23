import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const id = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  const season = await prisma.season.findUnique({
    where: { id },
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
        orderBy: { id: "asc" },
      },
      matches: {
        include: {
          homeTeam: {
            include: { teamReference: true },
          },
          awayTeam: {
            include: { teamReference: true },
          },
        },
        orderBy: [{ round: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!season) {
    throw createError({ statusCode: 404, message: "Сезон не найден" });
  }

  return season;
});
