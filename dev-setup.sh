#!/bin/bash

echo "🚀 Configurando ambiente de desenvolvimento local..."

# Parar containers existentes
echo "📦 Parando containers existentes..."
docker compose down

# Build das imagens
echo "🔨 Fazendo build das imagens..."
docker compose build --no-cache

# Subir os serviços
echo "🚀 Subindo os serviços..."
docker compose up -d

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados estar pronto..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker compose ps

# Mostrar logs da aplicação
echo "📝 Logs da aplicação (últimas 20 linhas):"
docker compose logs --tail=20 app

echo "✅ Ambiente configurado!"
echo "🌐 API disponível em: http://localhost:8080"
echo "📊 Para ver logs em tempo real: docker compose logs -f"
echo "🛑 Para parar: docker compose down"