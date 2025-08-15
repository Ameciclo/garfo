#!/bin/bash

echo "🚀 Setup rápido do Garfo para desenvolvimento"
echo "============================================="

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Executar setup
echo "🗄️ Configurando banco de dados..."
npm run setup:dev

echo ""
echo "✅ Setup concluído!"
echo "🚀 Para iniciar o servidor: npm run dev"
echo "📊 Para ver status do seed: npm run db:seed:status"