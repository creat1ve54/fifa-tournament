import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

const schema = z.object({
  round: z.number().min(1),
  homeTeamId: z.number(),
  awayTeamId: z.number(),
});

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const seasonId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const prisma = usePrisma();

  const season = await prisma.season.findUnique({
    where: { id: seasonId },
  });

  if (!season) {
    throw createError({ statusCode: 404, message: "Сезон не найден" });
  }

  if (season.status !== "SETUP") {
    throw createError({
      statusCode: 400,
      message: "Матчи можно добавлять только в статусе SETUP",
    });
  }

  if (season.calendarGenerationType !== "MANUAL") {
    throw createError({
      statusCode: 400,
      message: "Ручное добавление доступно только для MANUAL типа",
    });
  }

  const homeTeam = await prisma.seasonTeam.findFirst({
    where: { id: validation.data.homeTeamId, seasonId },
  });
  const awayTeam = await prisma.seasonTeam.findFirst({
    where: { id: validation.data.awayTeamId, seasonId },
  });

  if (!homeTeam || !awayTeam) {
    throw createError({
      statusCode: 400,
      message: "Обе команды должны быть в этом сезоне",
    });
  }

  if (validation.data.homeTeamId === validation.data.awayTeamId) {
    throw createError({
      statusCode: 400,
      message: "Команды должны быть разными",
    });
  }

  const existingMatch = await prisma.match.findFirst({
    where: {
      seasonId,
      round: validation.data.round,
      OR: [
        {
          homeTeamId: validation.data.homeTeamId,
          awayTeamId: validation.data.awayTeamId,
        },
        {
          homeTeamId: validation.data.awayTeamId,
          awayTeamId: validation.data.homeTeamId,
        },
      ],
    },
  });

  if (existingMatch) {
    throw createError({
      statusCode: 400,
      message: "Такой матч уже есть в этом туре",
    });
  }

  const match = await prisma.match.create({
    data: {
      seasonId,
      round: validation.data.round,
      homeTeamId: validation.data.homeTeamId,
      awayTeamId: validation.data.awayTeamId,
    },
    include: {
      homeTeam: { include: { teamReference: true } },
      awayTeam: { include: { teamReference: true } },
    },
  });

  return match;
});
