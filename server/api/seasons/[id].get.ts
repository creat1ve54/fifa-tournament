import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
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
      },
      matches: {
        include: {
          homeTeam: { include: { teamReference: true } },
          awayTeam: { include: { teamReference: true } },
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
