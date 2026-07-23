import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const seasons = await prisma.season.findMany({
    include: {
      _count: {
        select: {
          teams: true,
          matches: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return seasons;
});
