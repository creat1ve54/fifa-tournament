import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fifaNickname: true,
      totalPoints: true,
      seasonsPlayed: true,
    },
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "Игрок не найден" });
  }

  return user;
});
