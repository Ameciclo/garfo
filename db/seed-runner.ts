import { testConnection, closeConnections } from "./connection";

// Função para executar todos os seeds de forma segura
export async function runAll() {
  console.log("▶️ Iniciando todos os seeds...");
  
  // Verificar conexão antes de começar
  const connectionOk = await testConnection();
  if (!connectionOk) {
    throw new Error("Falha na conexão com o banco de dados");
  }
  
  try {
    // Importar seeds dinamicamente para usar a conexão unificada
    const { seedCities } = await import("./modules/global/seed_cities");
    const { seedCyclistCount } = await import("./modules/cyclist_count/seed_cyclist_count");
    const { seedCyclistInfra } = await import("./modules/cyclist_infra/seed_cyclist_infra");
    const { seedPCRStreets } = await import("./modules/global/seed_pcr_streets");
    const { seedCrashes, seedDatasusDeaths } = await import("./modules/casualties/casusalties_seed");
    const { seedSpeedPlates } = await import("./modules/global/seed_speed_plates");
    
    // Executar seeds em ordem
    console.log("🏙️ Seeding cities...");
    await seedCities();
    
    console.log("🚴 Seeding cyclist infrastructure...");
    await seedCyclistInfra();
    
    console.log("📊 Seeding cyclist count...");
    await seedCyclistCount();
    
    console.log("🛣️ Seeding PCR streets...");
    await seedPCRStreets();
    
    console.log("💥 Seeding crashes...");
    await seedCrashes();
    
    console.log("⚰️ Seeding Datasus deaths...");
    await seedDatasusDeaths();
    
    console.log("🚦 Seeding speed plates...");
    await seedSpeedPlates();
    
    console.log("🎉 Todos os seeds concluídos com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  } finally {
    // Sempre fechar conexões ao final
    await closeConnections();
  }
}