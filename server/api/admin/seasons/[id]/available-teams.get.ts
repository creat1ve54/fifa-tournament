import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const seasonId = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  // Получаем все активные команды из справочника
  const allTeams = await prisma.teamReference.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Получаем команды, уже добавленные в этот сезон
  const occupiedTeams = await prisma.seasonTeam.findMany({
    where: { seasonId },
    select: { teamReferenceId: true },
  });

  const occupiedIds = new Set(occupiedTeams.map((st) => st.teamReferenceId));

  // Фильтруем только свободные команды
  const availableTeams = allTeams.filter((team) => !occupiedIds.has(team.id));

  return availableTeams;
});
