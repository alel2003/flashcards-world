#!/bin/bash

echo "⏳ Waiting for database..."
until nc -z -v -w30 db 5432; do
  sleep 1
done
echo "✅ Database is ready!"

if [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "⚠️ No migrations found, creating initial migration..."
  npx prisma migrate dev --name init
fi

echo "🚀 Applying database migrations..."
npx prisma migrate deploy

echo "🛠 Generating Prisma Client..."
npx prisma generate

echo "🚀 Starting NestJS application..."
exec npm run start:dev
