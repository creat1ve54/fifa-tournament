import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

const schema = z.object({
  userId: z.number().nullable(),
});

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const seasonTeamId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const prisma = usePrisma();

  const seasonTeam = await prisma.seasonTeam.findUnique({
    where: { id: seasonTeamId },
  });

  if (!seasonTeam) {
    throw createError({ statusCode: 404, message: "Команда не найдена" });
  }

  // Если назначаем нового пользователя, проверяем, не занят ли он
  if (validation.data.userId) {
    const userOccupied = await prisma.seasonTeam.findFirst({
      where: {
        seasonId: seasonTeam.seasonId,
        userId: validation.data.userId,
        id: { not: seasonTeamId },
      },
    });

    if (userOccupied) {
      throw createError({
        statusCode: 400,
        message: "Этот участник уже играет за другую команду",
      });
    }
  }

  const updated = await prisma.seasonTeam.update({
    where: { id: seasonTeamId },
    data: { userId: validation.data.userId },
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
  });

  return updated;
});
