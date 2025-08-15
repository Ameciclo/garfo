#!/usr/bin/env tsx
import { testConnection, getDatabaseInfo } from "./db/connection";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function setupDev() {
  console.log("🚀 Configurando ambiente de desenvolvimento...\n");

  try {
    // 1. Testar conexão
    console.log("1️⃣ Testando conexão com banco de dados...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Não foi possível conectar ao banco. Verifique as configurações no .env");
      process.exit(1);
    }

    // 2. Executar migrações
    console.log("\n2️⃣ Executando migrações...");
    try {
      const { stdout } = await execAsync("npx drizzle-kit push");
      console.log("✅ Migrações executadas com sucesso!");
    } catch (error) {
      console.log("ℹ️ Migrações já aplicadas ou erro esperado:", error instanceof Error ? error.message : String(error));
    }

    // 3. Verificar estado do banco
    console.log("\n3️⃣ Verificando estado do banco...");
    const dbInfo = await getDatabaseInfo();
    console.log(`📊 Tabelas encontradas: ${dbInfo.tableCount}`);
    console.log(`💾 Tamanho do banco: ${dbInfo.databaseSize}`);
    
    if (dbInfo.tables.length > 0) {
      console.log("📋 Tabelas:", dbInfo.tables.slice(0, 5).join(", ") + 
        (dbInfo.tables.length > 5 ? "..." : ""));
    }

    // 4. Executar seed
    console.log("\n4️⃣ Executando seed dos dados...");
    console.log("⚠️ Este processo pode demorar alguns minutos...");
    
    try {
      const { stdout } = await execAsync("npm run db:seed:opt run all");
      console.log("✅ Seed executado com sucesso!");
    } catch (error) {
      console.log("⚠️ Seed pode ter sido parcialmente executado:", error instanceof Error ? error.message : String(error));
    }

    // 5. Verificar resultado final
    console.log("\n5️⃣ Verificando resultado final...");
    const finalInfo = await getDatabaseInfo();
    console.log(`📊 Total de tabelas: ${finalInfo.tableCount}`);
    console.log(`💾 Tamanho final: ${finalInfo.databaseSize}`);

    console.log("\n🎉 Setup de desenvolvimento concluído!");
    console.log("🚀 Agora você pode executar: npm run dev");

  } catch (error) {
    console.error("❌ Erro durante setup:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDev();
}