import { z } from "zod";
import crypto from "crypto";
import { usePrisma } from "~~/server/utils/prisma";
import { sendEmail } from "~~/server/utils/email";
import { requireUser } from "~~/server/utils/auth";

const schema = z.object({
  email: z.string().email("Некорректный email"),
});

export default defineEventHandler(async (event) => {
  // Проверяем, что пользователь авторизован
  const user = await requireUser(event);

  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.issues[0]?.message || "Ошибка валидации",
    });
  }

  const { email } = validation.data;
  const prisma = usePrisma();

  // Проверяем, не занят ли email другим пользователем
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.id !== user.id) {
    throw createError({
      statusCode: 400,
      message: "Этот email уже используется другим пользователем",
    });
  }

  // Если email тот же, что и текущий, ничего не делаем
  if (user.email === email) {
    return { success: true, message: "Email не изменился" };
  }

  // Генерируем токен подтверждения (действует 24 часа)
  const verifyToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Сохраняем новый email и токен в БД
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email,
      emailVerifyToken: verifyToken,
      emailVerifyExpiresAt: expiresAt,
      isEmailVerified: false, // Сбрасываем подтверждение до верификации нового email
    },
  });

  // Отправляем письмо на НОВЫЙ email для подтверждения
  const verifyLink = `https://gazliga.ru/verify-email?token=${verifyToken}`;

  await sendEmail(
    email,
    "Подтверждение нового email в GazLiga",
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
       <h2>Подтверждение смены email</h2>
       <p>Привет, ${user.fifaNickname || user.username}!</p>
       <p>Вы запросили смену email адреса. Для завершения операции подтвердите новый email:</p>
       <p style="margin: 20px 0;">
         <a href="${verifyLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
           Подтвердить email
         </a>
       </p>
       <p style="color: #666; font-size: 14px;">
         Если вы не запрашивали это изменение, проигнорируйте это письмо. Ссылка действительна 24 часа.
       </p>
     </div>`,
  );

  return {
    success: true,
    message: "На новый email отправлено письмо с подтверждением",
  };
});
