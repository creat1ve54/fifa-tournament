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
    throw createError({
      statusCode: 400,
      message: "Сезон уже активирован или завершён",
    });
  }

  if (season.teams.length < 2) {
    throw createError({ statusCode: 400, message: "Нужно минимум 2 команды" });
  }

  if (season.matches.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Сначала сгенерируйте календарь",
    });
  }

  const unassigned = season.teams.filter((t) => !t.userId);
  if (unassigned.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Не назначены участники для ${unassigned.length} команд(ы)`,
    });
  }

  await prisma.season.updateMany({
    where: { status: "ACTIVE" },
    data: { status: "FINISHED" },
  });

  const updated = await prisma.season.update({
    where: { id },
    data: {
      status: "ACTIVE",
      startDate: new Date(),
    },
  });

  return updated;
});
