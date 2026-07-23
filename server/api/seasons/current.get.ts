import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  const prisma = usePrisma();

  // Ищем активный сезон
  const currentSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
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
      },
    },
  });

  // Если нет активного, берём последний созданный
  if (!currentSeason) {
    const lastSeason = await prisma.season.findFirst({
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return lastSeason;
  }

  return currentSeason;
});
