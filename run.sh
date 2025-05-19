#!/usr/bin/env bash

# run.sh — menu de comandos essenciais para Docker, migrações, seed e Drizzle Studio
# Uso: chmod +x run.sh && ./run.sh

set -e

define_menu() {
  cat <<EOF
Selecione uma opção:

 1) Iniciar containers (build & up)
 2) Parar containers e remover volumes
 3) Mostrar logs do banco
 4) Gerar migrações (drizzle-kit generate)
 5) Gerar migrações custom (drizzle-kit generate --custom)
 6) Aplicar migrações (drizzle-kit migrate)
 7) Enviar schema para o banco (db:push)
 8) Popular banco (db:seed)
 9) Drop migrations (drizzle-kit drop)
10) Abrir Drizzle Studio
11) Sair
EOF
}

while true; do
  define_menu
  read -rp "Opção: " opt
  echo
  case "$opt" in
    1)
      docker compose up -d --build
      ;;
    2)
      docker compose down -v
      ;;
    3)
      docker compose logs -f db
      ;;
    4)
      docker compose exec app npx drizzle-kit generate \
        --dialect=postgresql \
        --schema=./db/schema.ts \
        --out=./drizzle
      ;;
    5)
      docker compose exec app npx drizzle-kit generate --custom
      ;;
    6)
      docker compose exec app npx drizzle-kit migrate
      ;;
    7)
      docker compose exec app npm run db:push
      ;;
    8)
      docker compose exec app npm run db:seed
      ;;
    9)
      docker compose exec app npx drizzle-kit drop
      ;;
   10)
      docker compose exec app npx drizzle-kit studio --host localhost --port 4983
      ;;
   11)
      echo "Saindo..."
      exit 0
      ;;
    *)
      echo "Opção inválida, tente novamente."
      ;;
  esac
  echo
 done
