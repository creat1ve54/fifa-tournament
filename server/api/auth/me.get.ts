import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  const userId = (session.user as any)?.id;

  if (!userId) {
    throw createError({ statusCode: 401, message: "Не авторизован" });
  }

  const prisma = usePrisma();
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "Пользователь не найден" });
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fifaNickname: user.fifaNickname,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    totalPoints: user.totalPoints,
    seasonsPlayed: user.seasonsPlayed,
  };
});
