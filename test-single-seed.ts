#!/usr/bin/env tsx

import { testConnection, closeConnections } from "./db/connection";

async function testSingleSeed() {
  console.log("🧪 Testando seed individual...");
  
  // Testar conexão
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log("❌ Falha na conexão");
    process.exit(1);
  }
  
  try {
    // Importar e executar apenas o seed de cities
    const { seedCities } = await import("./db/modules/global/seed_cities");
    console.log("🏙️ Executando seed de cities...");
    await seedCities();
    console.log("✅ Seed de cities concluído!");
    
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    // Fechar conexões
    console.log("🔌 Fechando conexões...");
    await closeConnections();
    console.log("👋 Processo finalizado!");
    process.exit(0);
  }
}

testSingleSeed();