#!/usr/bin/env tsx

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Debug da conexão...");
console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

async function debugConnection() {
  let client;
  try {
    console.log("⏳ Tentando conectar...");
    client = await pool.connect();
    console.log("✅ Conectado!");
    
    const result = await client.query('SELECT NOW()');
    console.log("⏰ Resultado:", result.rows[0]);
    
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

debugConnection();