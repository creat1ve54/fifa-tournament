import bcrypt from "bcryptjs";
import { z } from "zod";
import { usePrisma } from "~~/server/utils/prisma";

const schema = z.object({
  username: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
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

  const { username, password } = validation.data;
  const prisma = usePrisma();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Неверный логин или пароль",
    });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: "Неверный логин или пароль",
    });
  }

  // Создаём сессию через nuxt-auth-utils
  await setUserSession(event, {
    user: {
      id: user.id,
      username: user.username,
      fifaNickname: user.fifaNickname,
      role: user.role,
    },
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fifaNickname: user.fifaNickname,
      role: user.role,
      totalPoints: user.totalPoints,
      seasonsPlayed: user.seasonsPlayed,
    },
  };
});
