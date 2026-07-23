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

  // Удаляем все матчи этой команды в сезоне
  const seasonTeam = await prisma.seasonTeam.findUnique({
    where: { id },
  });

  if (!seasonTeam) {
    throw createError({ statusCode: 404, message: "Команда не найдена" });
  }

  // Удаляем матчи, где эта команда участвует
  await prisma.match.deleteMany({
    where: {
      seasonId: seasonTeam.seasonId,
      OR: [{ homeTeamId: id }, { awayTeamId: id }],
    },
  });

  // Удаляем саму запись
  await prisma.seasonTeam.delete({ where: { id } });

  return { success: true };
});
