import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";
import { requireUser } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const admin = await requireUser(event);
  if (admin.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещен" });
  }

  const seasonId = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const schema = z.object({
    status: z.enum(["SETUP", "ACTIVE", "FINISHED"]),
  });

  const validation = schema.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, message: "Неверный статус" });
  }

  const prisma = usePrisma();

  const updatedSeason = await prisma.season.update({
    where: { id: seasonId },
    data: { status: validation.data.status },
  });

  return { success: true, season: updatedSeason };
});
