import { usePrisma } from "~~/server/utils/prisma";
import type { User } from "~~/server/types";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };

  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const id = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();

  await prisma.season.delete({ where: { id } });

  return { success: true };
});
