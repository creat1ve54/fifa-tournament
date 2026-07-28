# Этап 1: Сборка
FROM node:24-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json* ./
# Используем npm install вместо ci, чтобы избежать бага edgesOut
RUN npm install

# Копируем весь проект
COPY . .

# Фиктивный URL только для этапа сборки, чтобы prisma generate не упал
ENV DATABASE_URL="postgresql://postgres:dummy_password@localhost:5432/fifa_tournament"

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем Nuxt
RUN npm run build

# ==========================================
# Этап 2: Продакшен
# ==========================================
FROM node:24-alpine

WORKDIR /app

# Копируем собранный проект (.output уже содержит всё нужное для запуска!)
COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma ./prisma

# Копируем .env.docker как .env (как в твоём варианте)
COPY --from=builder /app/.env.docker /app/.env

# Переменные окружения
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Копируем скрипт запуска
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Запускаем через скрипт
CMD ["./docker-entrypoint.sh"]