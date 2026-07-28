import { sendEmail } from "~~/server/utils/email";
import { usePrisma } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;

  // Безопасный ответ по умолчанию (защита от перебора email)
  const safeResponse = {
    success: true,
    message:
      "Если этот email привязан к аккаунту, мы отправили инструкцию по восстановлению.",
  };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return safeResponse;
  }

  const prisma = usePrisma();

  // 1. Ищем пользователя
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. КРИТИЧЕСКИ ВАЖНАЯ ПРОВЕРКА:
  // Если пользователя нет ИЛИ у него не заполнено поле email (старый аккаунт)
  // Мы возвращаем safeResponse.
  // TypeScript теперь знает, что ниже user.email гарантированно является string, а не null.
  if (!user || !user.email) {
    return safeResponse;
  }

  // 3. Генерируем токен (1 час)
  const resetToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 3600000);

  // 4. Сохраняем в БД
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpiresAt: expiresAt,
    },
  });

  // 5. Отправляем письмо (ОШИБКИ TS ЗДЕСЬ БОЛЬШЕ НЕТ)
  const resetLink = `https://gazliga.ru/reset-password?token=${resetToken}`;

  await sendEmail(
    user.email, // <-- Теперь TypeScript доволен, это точно string
    "Восстановление пароля GazLiga",
    `<p>Привет, ${user.username || "пользователь"}!</p>
     <p>Вы запросили восстановление пароля.</p>
     <p><a href="${resetLink}">Нажмите здесь, чтобы задать новый пароль</a></p>
     <p>Ссылка действительна 1 час.</p>`,
  );

  return safeResponse;
});
