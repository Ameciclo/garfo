#!/usr/bin/env tsx

import { testConnection, getDatabaseInfo, closeConnections } from "./db/connection";

async function runTests() {
  console.log("🚀 Iniciando testes de conexão unificados...\n");
  
  // Teste 1: Conexão básica
  console.log("=== TESTE 1: Conexão Básica ===");
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log("❌ Falha na conexão básica. Abortando testes.");
    process.exit(1);
  }
  
  console.log("\n=== TESTE 2: Informações do Banco ===");
  try {
    const info = await getDatabaseInfo();
    console.log(`📊 Total de tabelas: ${info.tableCount}`);
    console.log(`💾 Tamanho do banco: ${info.databaseSize}`);
    console.log("📋 Tabelas encontradas:");
    info.tables.forEach(table => console.log(`  - ${table}`));
  } catch (error) {
    console.error("❌ Erro ao obter informações do banco:", error);
  }
  
  console.log("\n✅ Todos os testes concluídos!");
  await closeConnections();
  process.exit(0);
}

runTests().catch((error) => {
  console.error("💥 Erro durante os testes:", error);
  process.exit(1);
});