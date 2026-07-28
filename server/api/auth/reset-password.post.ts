import { usePrisma } from "~~/server/utils/prisma";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token, newPassword } = body;

  if (!token || !newPassword || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      message: "Неверный запрос или пароль слишком короткий",
    });
  }

  const prisma = usePrisma();

  // 1. Ищем пользователя с действительным токеном
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: { gte: new Date() },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      message: "Неверный или истекший токен",
    });
  }

  // 2. Хэшируем новый пароль
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. Обновляем пароль и очищаем токены сброса
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return {
    success: true,
    message: "Пароль успешно изменен! Теперь вы можете войти.",
  };
});
