import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  const prisma = usePrisma();
  // ✅ ВАЖНО: findMany возвращает массив, findUnique требует id. Мы используем findMany.
  const seasons = await prisma.season.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      teams: {
        include: {
          teamReference: true,
          user: true,
        },
      },
      matches: {
        include: {
          homeTeam: { include: { teamReference: true } },
          awayTeam: { include: { teamReference: true } },
        },
        orderBy: [{ round: "asc" }, { id: "asc" }],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return seasons;
});
