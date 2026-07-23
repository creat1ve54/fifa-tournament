import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  const results = await prisma.seasonResult.findMany({
    where: { userId },
    include: {
      season: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { season: { endDate: "desc" } },
  });

  return results;
});
