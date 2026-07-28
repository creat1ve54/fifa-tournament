import { H3Event } from "h3";
import { usePrisma } from "./prisma";

export async function requireUser(event: H3Event) {
  const session = await getUserSession(event);

  // Явно указываем, что ожидаем id в сессии (обходим строгую типизацию сессии)
  const userId = (session.user as any)?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "Необходима авторизация",
    });
  }

  const prisma = usePrisma();

  // Здесь Prisma сам выведет правильный тип User со всеми полями (email, isEmailVerified и т.д.)
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: "Пользователь не найден",
    });
  }

  return user;
}
