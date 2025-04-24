#!/usr/bin/env bash

# run.sh — menu de comandos essenciais para Docker, migrações e seed
# Uso: chmod +x run.sh && ./run.sh

set -e

define_menu() {
  cat <<EOF
Selecione uma opção:

 1) Iniciar containers (build & up)
 2) Parar containers e remover volumes
 3) Mostrar logs do banco
 4) Gerar migrações (drizzle-kit generate)
 5) Aplicar migrações (drizzle-kit migrate)
 6) Enviar schema para o banco (db:push)
 7) Popular banco (db:seed)
 8) Sair
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
      docker compose exec app npx drizzle-kit migrate
      ;;
    6)
      docker compose exec app npm run db:push
      ;;
    7)
      docker compose exec app npm run db:seed
      ;;
    8)
      echo "Saindo..."
      exit 0
      ;;
    *)
      echo "Opção inválida, tente novamente."
      ;;
  esac
  echo
done
