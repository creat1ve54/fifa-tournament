import { usePrisma } from "~~/server/utils/prisma";
import { requireUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const admin = await requireUser(event);
  if (admin.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещен" });
  }

  const prisma = usePrisma();

  // Получаем все сезоны, отсортированные по дате создания (новые сверху)
  const seasons = await prisma.season.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      // Подсчитываем количество команд в каждом сезоне для удобства админа
      _count: {
        select: {
          teams: true,
          matches: true,
        },
      },
    },
  });

  return seasons;
});
