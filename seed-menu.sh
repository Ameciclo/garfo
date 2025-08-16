#!/bin/bash

echo "🌱 SEED MENU - Escolha o que fazer seed:"
echo ""
echo "1) Cities (cidades)"
echo "2) PCR Streets (ruas PCR)"
echo "3) SAMU Calls"
echo "4) CTTU Crashes"
echo "5) Datasus Deaths"
echo "6) Todos"
echo ""
echo "🗑️ LIMPAR CACHE:"
echo "7) Limpar cache SAMU"
echo "8) Limpar cache CTTU"
echo "9) Limpar cache Datasus"
echo "10) Limpar todo cache"
echo ""
echo "💥 DROPAR TABELAS:"
echo "11) Dropar tabela SAMU"
echo "12) Dropar tabela CTTU"
echo "13) Dropar tabela Datasus"
echo "14) Dropar todas tabelas casualties"
echo ""
echo "0) Sair"
echo ""
read -p "Escolha uma opção: " choice

case $choice in
    1)
        echo "🏙️ Fazendo seed das cidades..."
        docker compose exec app npx tsx -e "import { seedCities } from './db/modules/global/seed_cities'; seedCities().then(() => console.log('✅ Cities concluído')).catch(console.error)"
        ;;
    2)
        echo "🛣️ Fazendo seed das ruas PCR..."
        docker compose exec app npx tsx -e "import { seedPcrStreets } from './db/modules/global/seed_pcr_streets'; seedPcrStreets().then(() => console.log('✅ PCR Streets concluído')).catch(console.error)"
        ;;
    3)
        echo "🚑 Fazendo seed do SAMU..."
        docker compose exec app npx tsx -e "import { seedSamuCallsOptimized } from './db/modules/casualties/optimized_seed'; seedSamuCallsOptimized().then(() => console.log('✅ SAMU concluído')).catch(console.error)"
        ;;
    4)
        echo "🚗 Fazendo seed dos acidentes CTTU..."
        docker compose exec app npx tsx -e "import { seedCrashesOptimized } from './db/modules/casualties/optimized_seed'; seedCrashesOptimized().then(() => console.log('✅ CTTU concluído')).catch(console.error)"
        ;;
    5)
        echo "💀 Fazendo seed das mortes Datasus..."
        docker compose exec app npx tsx -e "import { seedDatasusDeathsOptimized } from './db/modules/casualties/optimized_seed'; seedDatasusDeathsOptimized().then(() => console.log('✅ Datasus concluído')).catch(console.error)"
        ;;
    6)
        echo "🌍 Fazendo seed de tudo..."
        docker compose exec app npx tsx db/seed.ts
        ;;
    7)
        echo "🗑️ Limpando cache do SAMU..."
        docker compose exec app npx tsx -e "import fs from 'fs'; const progress = JSON.parse(fs.readFileSync('db/.seed-progress.json', 'utf8')); delete progress['casualties_samu_sinistros-samu-2016-2025-ruas-corrigidas']; fs.writeFileSync('db/.seed-progress.json', JSON.stringify(progress, null, 2)); console.log('✅ Cache do SAMU removido');"
        ;;
    8)
        echo "🗑️ Limpando cache do CTTU..."
        docker compose exec app npx tsx -e "import fs from 'fs'; const progress = JSON.parse(fs.readFileSync('db/.seed-progress.json', 'utf8')); delete progress['casualties_crashes_sinistros']; fs.writeFileSync('db/.seed-progress.json', JSON.stringify(progress, null, 2)); console.log('✅ Cache do CTTU removido');"
        ;;
    9)
        echo "🗑️ Limpando cache do Datasus..."
        docker compose exec app npx tsx -e "import fs from 'fs'; const progress = JSON.parse(fs.readFileSync('db/.seed-progress.json', 'utf8')); Object.keys(progress).filter(k => k.includes('deaths_mortes')).forEach(k => delete progress[k]); fs.writeFileSync('db/.seed-progress.json', JSON.stringify(progress, null, 2)); console.log('✅ Cache do Datasus removido');"
        ;;
    10)
        echo "🗑️ Limpando todo cache..."
        docker compose exec app npx tsx -e "import fs from 'fs'; fs.writeFileSync('db/.seed-progress.json', '{}'); console.log('✅ Todo cache removido');"
        ;;
    11)
        echo "💥 Dropando tabela SAMU..."
        docker compose exec db psql -U postgres -d garfo_dev -c "TRUNCATE TABLE casualties.samu_calls;"
        echo "✅ Tabela SAMU limpa"
        ;;
    12)
        echo "💥 Dropando tabela CTTU..."
        docker compose exec db psql -U postgres -d garfo_dev -c "TRUNCATE TABLE casualties.cttu_crashes;"
        echo "✅ Tabela CTTU limpa"
        ;;
    13)
        echo "💥 Dropando tabela Datasus..."
        docker compose exec db psql -U postgres -d garfo_dev -c "TRUNCATE TABLE casualties.datasus_deaths;"
        echo "✅ Tabela Datasus limpa"
        ;;
    14)
        echo "💥 Dropando todas tabelas casualties..."
        docker compose exec db psql -U postgres -d garfo_dev -c "TRUNCATE TABLE casualties.samu_calls, casualties.cttu_crashes, casualties.datasus_deaths;"
        echo "✅ Todas tabelas casualties limpas"
        ;;
    0)
        echo "👋 Saindo..."
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac