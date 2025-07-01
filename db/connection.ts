import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolClient } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

// Configuração centralizada da conexão
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 10, // máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // 15 segundos
  acquireTimeoutMillis: 15000, // 15 segundos para adquirir conexão
  statement_timeout: 30000, // 30 segundos para queries
};

// Pool único para toda a aplicação
const pool = new Pool(connectionConfig);

// Instância do Drizzle ORM
export const db = drizzle<typeof schema>(pool, { schema });

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  let client: PoolClient | null = null;
  try {
    console.log("🔄 Testando conexão com o banco...");
    console.log(`📍 URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    
    console.log("✅ Conexão bem-sucedida!");
    console.log(`⏰ Hora do servidor: ${result.rows[0].current_time}`);
    console.log(`🗄️ Versão PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    return true;
  } catch (error) {
    console.error("❌ Erro de conexão:", error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Função para obter informações do banco
export async function getDatabaseInfo() {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    
    // Verificar tabelas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    // Verificar tamanho do banco
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    
    return {
      tables: tablesResult.rows.map(row => row.table_name),
      databaseSize: sizeResult.rows[0].size,
      tableCount: tablesResult.rows.length
    };
  } catch (error) {
    console.error("❌ Erro ao obter informações do banco:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Função para fechar todas as conexões
export async function closeConnections() {
  try {
    await pool.end();
    console.log("🔌 Conexões fechadas com sucesso");
  } catch (error) {
    console.error("❌ Erro ao fechar conexões:", error);
  }
}

// Tratamento de sinais para fechar conexões adequadamente
process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);