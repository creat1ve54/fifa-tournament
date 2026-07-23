import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const matchId = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw createError({ statusCode: 404, message: "Матч не найден" });
  }

  const season = await prisma.season.findUnique({
    where: { id: match.seasonId },
  });

  if (!season || season.status !== "SETUP") {
    throw createError({
      statusCode: 400,
      message: "Удалять матчи можно только в статусе SETUP",
    });
  }

  await prisma.match.delete({ where: { id: matchId } });

  return { success: true };
});
