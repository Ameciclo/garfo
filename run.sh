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
11) Reiniciar Docker
12) Build imagem para Docker Hub
13) Push imagem para Docker Hub
14) Build docker no cache
x) Sair
EOF
}

while true; do
  define_menu
  read -rp "Opção: " opt
  echo
  case "$opt" in
    1)
      npm run build
      docker compose build
      docker compose up -d
      ;;
    2)
      docker compose down -v
      ;;
    3)
      docker compose logs -f db
      ;;
    4)
      npx drizzle-kit generate \
        --dialect=postgresql \
        --schema=./db/schema.ts \
        --out=./drizzle
      ;;
    5)
      npx drizzle-kit generate --custom
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
      npx drizzle-kit drop
      ;;
   10)
      docker compose exec app npx drizzle-kit studio --host localhost --port 4983
      ;;
   11)
      npm run build
      docker compose restart app
      ;;
   12)
      read -rp "Digite seu usuário do Docker Hub: " docker_user
      read -rp "Digite o nome da imagem: " image_name
      read -rp "Digite a tag (padrão: latest): " tag
      tag=${tag:-latest}
      docker build -t "$docker_user/$image_name:$tag" .
      echo "Imagem construída: $docker_user/$image_name:$tag"
      ;;
   13)
      read -rp "Digite seu usuário do Docker Hub: " docker_user
      read -rp "Digite o nome da imagem: " image_name
      read -rp "Digite a tag (padrão: latest): " tag
      tag=${tag:-latest}
      echo "Fazendo push da imagem: $docker_user/$image_name:$tag"
      docker push "$docker_user/$image_name:$tag"
      echo "Push concluído!"
      ;;
    14)
      npm run build
      docker compose build --no-cache
      docker compose up -d
      ;;
   x)
      echo "Saindo..."
      exit 0
      ;;
    *)
      echo "Opção inválida, tente novamente."
      ;;
  esac
  echo
 done
