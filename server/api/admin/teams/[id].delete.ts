import { User } from "~~/server/types";
import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };
  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const id = Number(getRouterParam(event, "id"));
  const prisma = usePrisma();
  await prisma.teamReference.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
});
