#!/usr/bin/env tsx

import { testConnection, closeConnections } from "./db/connection";

const SEEDS = {
  cities: () => import("./db/modules/global/seed_cities").then(m => m.seedCities()),
  cyclist_infra: () => import("./db/modules/cyclist_infra/seed_cyclist_infra").then(m => m.seedCyclistInfra()),
  cyclist_count: () => import("./db/modules/cyclist_count/seed_cyclist_count").then(m => m.seedCyclistCount()),
  pcr_streets: () => import("./db/modules/global/seed_pcr_streets").then(m => m.seedPCRStreets()),
  crashes: () => import("./db/modules/casualties/casusalties_seed").then(m => m.seedCrashes()),
  datasus_deaths: () => import("./db/modules/casualties/casusalties_seed").then(m => m.seedDatasusDeaths()),
  speed_plates: () => import("./db/modules/global/seed_speed_plates").then(m => m.seedSpeedPlates()),
};

async function runIndividualSeed(seedName: string) {
  console.log(`🧪 Testando seed: ${seedName}`);
  
  // Testar conexão
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log("❌ Falha na conexão");
    process.exit(1);
  }
  
  try {
    const seedFunction = SEEDS[seedName as keyof typeof SEEDS];
    if (!seedFunction) {
      console.log(`❌ Seed '${seedName}' não encontrado`);
      console.log("Seeds disponíveis:", Object.keys(SEEDS).join(", "));
      process.exit(1);
    }
    
    console.log(`🚀 Executando seed de ${seedName}...`);
    const startTime = Date.now();
    
    await seedFunction();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Seed de ${seedName} concluído em ${duration}s!`);
    
  } catch (error) {
    console.error(`❌ Erro no seed de ${seedName}:`, error);
  } finally {
    console.log("🔌 Fechando conexões...");
    await closeConnections();
    console.log("👋 Processo finalizado!");
    process.exit(0);
  }
}

// Pegar o nome do seed dos argumentos
const seedName = process.argv[2];
if (!seedName) {
  console.log("📋 Seeds disponíveis:");
  Object.keys(SEEDS).forEach(name => console.log(`  - ${name}`));
  console.log("\n💡 Uso: npx tsx test-individual-seeds.ts <nome_do_seed>");
  process.exit(1);
}

runIndividualSeed(seedName);