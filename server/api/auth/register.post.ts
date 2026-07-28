import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { usePrisma } from "~~/server/utils/prisma";
import { sendEmail } from "~~/server/utils/email";

const schema = z.object({
  username: z.string().min(3, "Минимум 3 символа"),
  password: z.string().min(6, "Минимум 6 символов"),
  fifaNickname: z.string().min(1, "Укажите ник в FIFA"),
  email: z.string().email("Некорректный email"), // ← ДОБАВЛЕНО
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = schema.safeParse(body);
  if (!validation.success) {
    const errorMessage =
      validation.error.issues[0]?.message || "Ошибка валидации";
    throw createError({ statusCode: 400, message: errorMessage });
  }

  const { username, password, fifaNickname, email } = validation.data;
  const prisma = usePrisma();

  // Проверяем, не занят ли логин или email
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    throw createError({
      statusCode: 400,
      message: "Логин или email уже заняты",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Генерируем токен подтверждения email (действует 24 часа)
  const verifyToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      fifaNickname,
      emailVerifyToken: verifyToken,
      emailVerifyExpiresAt: expiresAt,
      isEmailVerified: false,
    },
  });

  // Отправляем письмо с подтверждением
  const verifyLink = `https://gazliga.ru/verify-email?token=${verifyToken}`;

  await sendEmail(
    email,
    "Подтверждение регистрации в GazLiga",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
       <h2>Добро пожаловать в GazLiga!</h2>
       <p>Привет, ${fifaNickname}!</p>
       <p>Для завершения регистрации подтверди свой email:</p>
       <p style="margin: 20px 0;">
         <a href="${verifyLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
           Подтвердить email
         </a>
       </p>
       <p style="color: #666; font-size: 14px;">Ссылка действительна 24 часа.</p>
     </div>`,
  );

  return {
    success: true,
    message: "Регистрация успешна! Проверьте почту для подтверждения.",
    user: {
      id: user.id,
      username: user.username,
      fifaNickname: user.fifaNickname,
      role: user.role,
    },
  };
});
