#!/bin/sh
set -e
echo "[disc-eloca] Aplicando migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

if [ "$RUN_SEED_ON_START" = "true" ]; then
  echo "[disc-eloca] Rodando seed..."
  npx tsx prisma/seed.ts || echo "[disc-eloca] Seed falhou ou já aplicado, continuando."
fi

echo "[disc-eloca] Iniciando servidor..."
exec npm run start
