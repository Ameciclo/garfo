import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testConnection() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida!');
    await client.query('SELECT NOW()');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro de conexão:', err);
    process.exit(1);
  }
}

testConnection();