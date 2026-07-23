import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

const schema = z.object({
  homeScore: z.number().min(0),
  awayScore: z.number().min(0),
});

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const matchId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const prisma = usePrisma();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!match) {
    throw createError({ statusCode: 404, message: "Матч не найден" });
  }

  if (match.isPlayed && match.homeScore !== null && match.awayScore !== null) {
    await rollbackMatchStats(prisma, match);
  }

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: validation.data.homeScore,
      awayScore: validation.data.awayScore,
      isPlayed: true,
    },
  });

  await applyMatchStats(prisma, {
    ...match,
    homeScore: validation.data.homeScore,
    awayScore: validation.data.awayScore,
  });

  return updatedMatch;
});

async function rollbackMatchStats(prisma: any, match: any) {
  const homeDelta = getStatsDelta(match.homeScore!, match.awayScore!, true);
  const awayDelta = getStatsDelta(match.homeScore!, match.awayScore!, false);

  await prisma.seasonTeam.update({
    where: { id: match.homeTeamId },
    data: {
      played: { decrement: 1 },
      won: { decrement: homeDelta.won },
      drawn: { decrement: homeDelta.drawn },
      lost: { decrement: homeDelta.lost },
      goalsFor: { decrement: match.homeScore },
      goalsAgainst: { decrement: match.awayScore },
      points: { decrement: homeDelta.points },
    },
  });

  await prisma.seasonTeam.update({
    where: { id: match.awayTeamId },
    data: {
      played: { decrement: 1 },
      won: { decrement: awayDelta.won },
      drawn: { decrement: awayDelta.drawn },
      lost: { decrement: awayDelta.lost },
      goalsFor: { decrement: match.awayScore },
      goalsAgainst: { decrement: match.homeScore },
      points: { decrement: awayDelta.points },
    },
  });
}

async function applyMatchStats(prisma: any, match: any) {
  const homeDelta = getStatsDelta(match.homeScore!, match.awayScore!, true);
  const awayDelta = getStatsDelta(match.homeScore!, match.awayScore!, false);

  await prisma.seasonTeam.update({
    where: { id: match.homeTeamId },
    data: {
      played: { increment: 1 },
      won: { increment: homeDelta.won },
      drawn: { increment: homeDelta.drawn },
      lost: { increment: homeDelta.lost },
      goalsFor: { increment: match.homeScore },
      goalsAgainst: { increment: match.awayScore },
      points: { increment: homeDelta.points },
    },
  });

  await prisma.seasonTeam.update({
    where: { id: match.awayTeamId },
    data: {
      played: { increment: 1 },
      won: { increment: awayDelta.won },
      drawn: { increment: awayDelta.drawn },
      lost: { increment: awayDelta.lost },
      goalsFor: { increment: match.awayScore },
      goalsAgainst: { increment: match.homeScore },
      points: { increment: awayDelta.points },
    },
  });
}

function getStatsDelta(homeScore: number, awayScore: number, isHome: boolean) {
  const teamScore = isHome ? homeScore : awayScore;
  const opponentScore = isHome ? awayScore : homeScore;

  if (teamScore > opponentScore) {
    return { won: 1, drawn: 0, lost: 0, points: 3 };
  } else if (teamScore === opponentScore) {
    return { won: 0, drawn: 1, lost: 0, points: 1 };
  } else {
    return { won: 0, drawn: 0, lost: 1, points: 0 };
  }
}
