#!/usr/bin/env tsx
import { OptimizedSeeder } from "./optimized-seed";
import { seedCities } from "./modules/global/seed_cities";
import { seedCyclistInfra } from "./modules/cyclist_infra/seed_cyclist_infra";
import { seedCyclistCountOptimized } from "./modules/cyclist_count/optimized_seed";
import { seedPCRStreets } from "./modules/global/seed_pcr_streets";
import { seedCrashesOptimized, seedDatasusDeathsOptimized } from "./modules/casualties/optimized_seed";
import { seedSpeedPlates } from "./modules/global/seed_speed_plates";

const MODULES = {
  cities: () => seedCities(),
  cyclist_infra: () => seedCyclistInfra(),
  cyclist_count: () => seedCyclistCountOptimized(),
  pcr_streets: () => seedPCRStreets(),
  crashes: () => seedCrashesOptimized(),
  datasus_deaths: () => seedDatasusDeathsOptimized(),
  speed_plates: () => seedSpeedPlates(),
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const module = args[1];
  
  const seeder = new OptimizedSeeder();

  try {
    switch (command) {
      case 'run':
        if (module && module in MODULES) {
          console.log(`🚀 Executando seed: ${module}`);
          await MODULES[module as keyof typeof MODULES]();
        } else if (module === 'all') {
          console.log("🚀 Executando todos os seeds...");
          for (const [name, fn] of Object.entries(MODULES)) {
            console.log(`\n📦 Iniciando ${name}...`);
            try {
              await fn();
            } catch (error) {
              console.error(`❌ Erro em ${name}:`, error.message);
              console.log(`⏭️ Continuando para o próximo módulo...`);
            }
          }
          console.log("🎉 Todos os seeds processados!");
        } else {
          console.log("Módulos disponíveis:", Object.keys(MODULES).join(', '));
        }
        break;

      case 'status':
        seeder.showProgress();
        break;

      case 'reset':
        if (module) {
          await seeder.resetProgress(module);
          console.log(`🔄 Progresso resetado para: ${module}`);
        } else {
          await seeder.resetProgress();
          console.log("🔄 Todo progresso resetado");
        }
        break;

      case 'resume':
        console.log("🔄 Retomando seeds interrompidos...");
        // Executa apenas os não completados
        for (const [name, fn] of Object.entries(MODULES)) {
          console.log(`\n📦 Verificando ${name}...`);
          await fn();
        }
        break;

      default:
        console.log(`
🌱 Garfo Optimized Seeder

Comandos:
  run <module>     - Executa seed específico
  run all          - Executa todos os seeds
  status           - Mostra progresso atual
  reset [module]   - Reseta progresso (específico ou geral)
  resume           - Retoma seeds interrompidos

Módulos: ${Object.keys(MODULES).join(', ')}

Exemplos:
  npm run db:seed:opt run cyclist_count
  npm run db:seed:opt run all
  npm run db:seed:opt status
  npm run db:seed:opt reset casualties
        `);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await seeder.cleanup();
  }
}

if (require.main === module) {
  main();
}