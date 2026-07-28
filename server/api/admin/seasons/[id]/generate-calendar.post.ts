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
    include: { teams: true, matches: true },
  });

  if (!season) {
    throw createError({ statusCode: 404, message: "Сезон не найден" });
  }

  if (season.status !== "SETUP") {
    throw createError({ statusCode: 400, message: "Сезон уже активирован" });
  }

  if ((season.teams || []).length < 2) {
    throw createError({ statusCode: 400, message: "Нужно минимум 2 команды" });
  }

  if ((season.matches || []).length > 0) {
    await prisma.match.deleteMany({ where: { seasonId: id } });
  }

  // ✅ ИСПРАВЛЕНИЕ: добавлено || []
  const teamIds = (season.teams || []).map((t) => t.id);
  const n = teamIds.length;
  const roundsCount = season.roundsCount;

  const isOdd = n % 2 !== 0;
  const teams = [...teamIds];
  if (isOdd) {
    teams.push(-1);
  }

  const totalTeams = teams.length;
  const rounds: { home: number; away: number }[][] = [];

  const fixed = teams[0];
  const rotating = teams.slice(1);

  for (let round = 0; round < totalTeams - 1; round++) {
    const roundMatches: { home: number; away: number }[] = [];
    const current = [fixed, ...rotating];

    for (let i = 0; i < totalTeams / 2; i++) {
      const home = current[i];
      const away = current[totalTeams - 1 - i];

      if (home === undefined || away === undefined) continue;
      if (home === -1 || away === -1) continue;

      if (round % 2 === 0) {
        roundMatches.push({ home, away });
      } else {
        roundMatches.push({ home: away, away: home });
      }
    }
    rounds.push(roundMatches);

    const last = rotating.pop();
    if (last !== undefined) {
      rotating.unshift(last);
    }
  }

  const allMatches: {
    seasonId: number;
    round: number;
    homeTeamId: number;
    awayTeamId: number;
  }[] = [];

  for (let circle = 0; circle < roundsCount; circle++) {
    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      const roundMatches = rounds[roundIdx];
      if (!roundMatches) continue;

      const actualRound = circle * rounds.length + roundIdx + 1;

      for (const match of roundMatches) {
        allMatches.push({
          seasonId: id,
          round: actualRound,
          homeTeamId: circle === 1 ? match.away : match.home,
          awayTeamId: circle === 1 ? match.home : match.away,
        });
      }
    }
  }

  await prisma.match.createMany({ data: allMatches });

  return {
    success: true,
    matchesCreated: allMatches.length,
    rounds: rounds.length * roundsCount,
  };
});
