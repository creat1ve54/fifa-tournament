import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Не авторизован" });
  }

  const prisma = usePrisma();

  // Получаем актуальные данные из базы
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      fifaNickname: true,
      role: true,
      totalPoints: true,
      seasonsPlayed: true,
    },
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "Пользователь не найден" });
  }

  return user;
});
