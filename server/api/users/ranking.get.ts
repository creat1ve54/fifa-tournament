import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      username: true,
      fifaNickname: true,
      totalPoints: true,
      seasonsPlayed: true,
    },
    orderBy: [{ totalPoints: "desc" }, { seasonsPlayed: "desc" }],
  });

  // Добавляем место в рейтинге
  return users.map((user, index) => ({
    ...user,
    place: index + 1,
  }));
});
