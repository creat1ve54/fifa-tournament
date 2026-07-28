import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token } = body;

  if (!token) {
    throw createError({ statusCode: 400, message: "Токен не предоставлен" });
  }

  const prisma = usePrisma();

  // 1. Ищем пользователя с этим токеном, который еще не истек
  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpiresAt: { gte: new Date() },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      message: "Неверный или истекший токен",
    });
  }

  // 2. Обновляем пользователя: подтверждаем почту и очищаем токен
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiresAt: null,
      // Если ты хочешь, чтобы аккаунт был неактивен до подтверждения, раскомментируй строку ниже:
      isActive: true,
    },
  });

  return {
    success: true,
    message: "Email успешно подтвержден! Теперь вы можете войти.",
  };
});
