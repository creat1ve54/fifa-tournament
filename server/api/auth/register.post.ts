import bcrypt from "bcryptjs";
import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
  fifaNickname: z.string().min(1, "Укажите ник в FIFA"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = schema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Ошибка валидации";
    throw createError({
      statusCode: 400,
      message: errorMessage,
    });
  }

  const { username, password, fifaNickname } = validation.data;
  const prisma = usePrisma();
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw createError({ statusCode: 400, message: "Логин уже занят" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashedPassword, fifaNickname },
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fifaNickname: user.fifaNickname,
      role: user.role,
    },
  };
});
