import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  // Ищем команду в активном сезоне
  const team = await prisma.seasonTeam.findFirst({
    where: {
      userId,
      season: {
        status: "ACTIVE",
      },
    },
    include: {
      teamReference: true,
      season: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return team;
});
