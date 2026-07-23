import { z } from "zod";
import { User } from "~~/server/types";
import { usePrisma } from "~~/server/utils/prisma";

const schema = z.object({
  name: z.string().min(1, "Укажите название"),
  shortName: z
    .string()
    .min(2, "Минимум 2 символа")
    .max(5, "Максимум 5 символов"),
  logo: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const session = (await getUserSession(event)) as unknown as {
    user: User | undefined;
  };
  if (!session?.user || session.user.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Доступ запрещён" });
  }

  const body = await readBody(event);
  const validation = schema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const prisma = usePrisma();

  const existing = await prisma.teamReference.findFirst({
    where: {
      OR: [
        { name: validation.data.name },
        { shortName: validation.data.shortName.toUpperCase() },
      ],
    },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "Команда с таким названием или кодом уже существует",
    });
  }

  const team = await prisma.teamReference.create({
    data: {
      name: validation.data.name,
      shortName: validation.data.shortName.toUpperCase(),
      logo: validation.data.logo || null,
    },
  });

  return team;
});
