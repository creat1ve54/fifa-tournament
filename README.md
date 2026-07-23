# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Посмотреть статус

docker-compose ps

# Перезапустить приложение

docker-compose restart app

# Посмотреть логи базы

docker-compose logs postgres

# Очистить всё

docker-compose down -v --rmi all


📝 Шпаргалка на каждый день
Что хочешь сделать
Команда
Начать работу над проектом
docker compose up -d postgres затем npm run dev
Изменил схему БД (schema.prisma)
npx prisma db push
Посмотреть логи базы (если ошибка)
docker compose logs postgres
Полностью сбросить базу (удалить все данные)
docker compose down -v затем docker compose up -d
Обновить сайт на сервере
git pull → docker compose up -d --build
