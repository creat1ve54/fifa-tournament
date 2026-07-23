import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

const schema = z.object({
  name: z.string().min(1, "Укажите название"),
  roundsCount: z.number().min(1).max(2),
  calendarGenerationType: z.enum(["AUTO", "MANUAL"]),
});

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const prisma = usePrisma();

  // Проверяем, существует ли сезон с таким названием
  const existing = await prisma.season.findUnique({
    where: { name: validation.data.name },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "Сезон с таким названием уже существует",
    });
  }

  const season = await prisma.season.create({
    data: {
      name: validation.data.name,
      roundsCount: validation.data.roundsCount,
      calendarGenerationType: validation.data.calendarGenerationType,
      status: "SETUP",
    },
  });

  return season;
});
