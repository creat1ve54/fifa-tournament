import { User } from "~~/server/types";
import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };
  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const prisma = usePrisma();

  const teams = await prisma.teamReference.findMany({
    orderBy: { name: "asc" },
  });

  return teams;
});
