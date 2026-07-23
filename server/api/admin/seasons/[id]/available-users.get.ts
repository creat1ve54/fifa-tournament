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

  // Получаем всех пользователей
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fifaNickname: true,
    },
    orderBy: { username: "asc" },
  });

  // Получаем пользователей, уже занятых в этом сезоне
  const occupiedUsers = await prisma.seasonTeam.findMany({
    where: { seasonId },
    select: { userId: true },
  });

  const occupiedIds = new Set(occupiedUsers.map((st) => st.userId));

  // Фильтруем свободных пользователей
  const availableUsers = allUsers.filter((user) => !occupiedIds.has(user.id));

  return availableUsers;
});
