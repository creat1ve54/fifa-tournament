import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

function getPointsForPlace(place: number): number {
  if (place === 1) return 100;
  if (place === 2) return 90;
  if (place === 3) return 80;
  if (place === 4) return 70;
  if (place === 5) return 60;
  if (place >= 6 && place <= 10) return 50;
  if (place >= 11 && place <= 20) return 30;
  return 10;
}

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
      teams: { include: { user: true } },
      results: true,
    },
  });

  if (!season) {
    throw createError({ statusCode: 404, message: "Сезон не найден" });
  }

  if (season.status !== "ACTIVE") {
    throw createError({
      statusCode: 400,
      message: "Сезон должен быть активным",
    });
  }

  // Добавили || [] на случай, если teams вдруг undefined (защита)
  const sortedTeams = [...(season.teams || [])].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  if (season.results.length > 0) {
    await prisma.seasonResult.deleteMany({ where: { seasonId: id } });
  }

  // ✅ ИСПРАВЛЕНИЕ: используем entries() для безопасного получения индекса и элемента
  for (const [index, team] of sortedTeams.entries()) {
    // Явная проверка успокаивает TypeScript
    if (!team || !team.userId) continue;

    const place = index + 1;
    const points = getPointsForPlace(place);

    await prisma.seasonResult.create({
      data: {
        seasonId: id,
        userId: team.userId,
        place,
        points,
        wins: team.won,
        draws: team.drawn,
        losses: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
      },
    });

    await prisma.user.update({
      where: { id: team.userId },
      data: {
        totalPoints: { increment: points },
        seasonsPlayed: { increment: 1 },
      },
    });
  }

  const updated = await prisma.season.update({
    where: { id },
    data: {
      status: "FINISHED",
      endDate: new Date(),
    },
  });

  return { success: true, season: updated };
});
