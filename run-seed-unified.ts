#!/usr/bin/env tsx

import { testConnection, getDatabaseInfo, closeConnections } from "./db/connection";

async function runSeedWithTests() {
  console.log("🌱 Iniciando processo de seed unificado...\n");
  
  // Teste inicial de conexão
  console.log("=== PRÉ-TESTE: Verificação de Conexão ===");
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log("❌ Falha na conexão. Abortando seed.");
    process.exit(1);
  }
  
  // Informações do banco antes do seed
  console.log("\n=== ESTADO INICIAL DO BANCO ===");
  try {
    const initialInfo = await getDatabaseInfo();
    console.log(`📊 Tabelas antes do seed: ${initialInfo.tableCount}`);
    console.log(`💾 Tamanho inicial: ${initialInfo.databaseSize}`);
  } catch (error) {
    console.error("⚠️ Erro ao obter informações iniciais:", error);
  }
  
  // Executar seed
  console.log("\n=== EXECUTANDO SEED ===");
  try {
    // Importar e executar o seed
    const { runAll } = await import("./db/seed-runner");
    await runAll();
    console.log("✅ Seed executado com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  }
  
  // Informações do banco após o seed
  console.log("\n=== ESTADO FINAL DO BANCO ===");
  try {
    const finalInfo = await getDatabaseInfo();
    console.log(`📊 Tabelas após o seed: ${finalInfo.tableCount}`);
    console.log(`💾 Tamanho final: ${finalInfo.databaseSize}`);
    console.log("📋 Tabelas criadas:");
    finalInfo.tables.forEach(table => console.log(`  - ${table}`));
  } catch (error) {
    console.error("⚠️ Erro ao obter informações finais:", error);
  }
  
  console.log("\n🎉 Processo de seed concluído!");
  await closeConnections();
  process.exit(0);
}

runSeedWithTests().catch((error) => {
  console.error("💥 Erro durante o processo:", error);
  process.exit(1);
});