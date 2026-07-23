#!/bin/sh

BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_NAME="fifa_tournament"
DB_USER="postgres"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres123}"

# Создаём папку
mkdir -p $BACKUP_DIR

# Делаем дамп
PGPASSWORD=$DB_PASSWORD pg_dump -h postgres -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/fifa_$DATE.sql"

# Проверяем, что файл не пустой
if [ -s "$BACKUP_DIR/fifa_$DATE.sql" ]; then
  echo "✅ Бэкап создан: fifa_$DATE.sql"
else
  echo "❌ Ошибка: бэкап пустой!"
  rm -f "$BACKUP_DIR/fifa_$DATE.sql"
  exit 1
fi

# Удаляем старые бэкапы (оставляем 7 последних)
ls -t $BACKUP_DIR/fifa_*.sql 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null

echo " Всего бэкапов: $(ls $BACKUP_DIR/fifa_*.sql 2>/dev/null | wc -l)"