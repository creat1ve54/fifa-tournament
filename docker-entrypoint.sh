#!/bin/sh
set -e

echo "🔄 Синхронизация базы данных..."
# Флаг --url переопределяет prisma.config.ts и использует реальный URL из .env
npx prisma db push --url "$DATABASE_URL" --accept-data-loss

echo "🚀 Запуск Nuxt приложения..."
exec node .output/server/index.mjs