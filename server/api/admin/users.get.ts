import { usePrisma } from "~~/server/utils/prisma";
import { requireUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  // 1. Проверяем, что запрос делает администратор
  const admin = await requireUser(event);
  if (admin.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещен" });
  }

  const prisma = usePrisma();

  // 2. Получаем ТОЛЬКО подтвержденных пользователей
  const users = await prisma.user.findMany({
    where: {
      isEmailVerified: true, // ← ГЛАВНОЕ ИЗМЕНЕНИЕ
    },
    // Выбираем только нужные поля, чтобы не светить пароли и лишние данные
    select: {
      id: true,
      username: true,
      fifaNickname: true,
      email: true,
    },
    orderBy: {
      username: "asc", // Сортируем по алфавиту для удобства
    },
  });

  return users;
});
