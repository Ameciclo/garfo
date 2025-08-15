#!/bin/bash

echo "🚀 Setup LOCAL do Garfo para desenvolvimento"
echo "============================================="

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose -f docker-compose.dev.yml down

# Iniciar banco PostgreSQL local
echo "🐘 Iniciando PostgreSQL local..."
docker compose -f docker-compose.dev.yml up -d

# Aguardar banco ficar pronto
echo "⏳ Aguardando banco ficar pronto..."
sleep 10

# Verificar se banco está rodando
if ! docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "❌ Erro: Banco não iniciou corretamente"
    exit 1
fi

echo "✅ Banco PostgreSQL rodando na porta 5432"

# Usar configurações locais
echo "🔧 Usando configurações locais..."
cp .env.local .env

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Executar setup
echo "🗄️ Configurando banco de dados LOCAL..."
npm run setup:dev

echo ""
echo "✅ Setup LOCAL concluído!"
echo "🚀 Para iniciar o servidor: npm run dev"
echo "📊 Para ver status do seed: npm run db:seed:status"
echo "🐘 Banco PostgreSQL: localhost:5432"
echo "🛑 Para parar o banco: docker compose -f docker-compose.dev.yml down"