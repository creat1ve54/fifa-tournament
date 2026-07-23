import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Не авторизован" });
  }

  const prisma = usePrisma();

  const currentSeason = await prisma.season.findFirst({
    where: {
      status: "ACTIVE",
    },
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
          homeTeam: {
            include: {
              teamReference: true,
            },
          },
          awayTeam: {
            include: {
              teamReference: true,
            },
          },
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
        matches: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return lastSeason;
  }

  return currentSeason;
});
