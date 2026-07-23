import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

const schema = z.object({
  teamReferenceId: z.number(),
  userId: z.number().nullable().optional(),
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

  try {
    // Упрощённая проверка - ищем команду в сезоне
    const existing = await prisma.seasonTeam.findFirst({
      where: {
        seasonId,
        teamReferenceId: validation.data.teamReferenceId,
      },
    });

    if (existing) {
      throw createError({
        statusCode: 400,
        message: "Эта команда уже добавлена в сезон",
      });
    }

    // Проверяем, не занят ли пользователь
    if (validation.data.userId) {
      const userOccupied = await prisma.seasonTeam.findFirst({
        where: {
          seasonId,
          userId: validation.data.userId,
        },
      });

      if (userOccupied) {
        throw createError({
          statusCode: 400,
          message: "Этот участник уже играет за другую команду",
        });
      }
    }

    // Создаём запись
    const seasonTeam = await prisma.seasonTeam.create({
      data: {
        seasonId,
        teamReferenceId: validation.data.teamReferenceId,
        userId: validation.data.userId || null,
      },
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

    return seasonTeam;
  } catch (error: any) {
    console.error("Error creating season team:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Ошибка создания команды: " + error.message,
    });
  }
});
