#!/bin/sh
# Entrypoint de produção: transforma secrets do Swarm em variáveis de ambiente.
# Nenhuma credencial fica dentro da imagem ou no compose.
set -e

if [ -f /run/secrets/hospital_database_url ] && [ -z "${DATABASE_URL:-}" ]; then
    export DATABASE_URL="$(cat /run/secrets/hospital_database_url)"
fi

if [ -f /run/secrets/hospital_jwt_secret ] && [ -z "${JWT_SECRET:-}" ]; then
    export JWT_SECRET="$(cat /run/secrets/hospital_jwt_secret)"
fi

# Aplica migrações pendentes antes de iniciar a API. Roda no mesmo processo,
# então enxerga a DATABASE_URL exportada acima (um `docker exec` não enxergaria).
if [ -d /app/prisma/migrations ]; then
    echo "Aplicando migrações do Prisma..."
    pnpm prisma migrate deploy
fi

exec "$@"
