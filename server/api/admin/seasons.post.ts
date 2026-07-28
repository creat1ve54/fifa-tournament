import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import { requireUser } from "~~/server/utils/auth";

const schema = z.object({
  name: z.string().min(3, "Название сезона должно быть не менее 3 символов"),
  roundsCount: z.number().int().min(1, "Минимум 1 тур"),
  calendarGenerationType: z.enum(["AUTO", "MANUAL"]),
  isCurrent: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const admin = await requireUser(event);
  if (admin.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещен" });
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
  const { name, roundsCount, calendarGenerationType, isCurrent } =
    validation.data;

  // 💡 ВАЖНО: Если админ ставит галочку "Текущий сезон",
  // мы снимаем эту галочку со всех остальных сезонов, чтобы "текущий" был всегда один.
  // Но это НЕ мешает существовать и быть активным (status: ACTIVE) множеству других сезонов!
  if (isCurrent) {
    await prisma.season.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  // Создаем новый сезон
  const newSeason = await prisma.season.create({
    data: {
      name,
      roundsCount,
      calendarGenerationType,
      isCurrent,
      status: "SETUP", // Новый сезон всегда создается в режиме настройки
    },
  });

  return {
    success: true,
    message: "Сезон успешно создан",
    season: newSeason,
  };
});
