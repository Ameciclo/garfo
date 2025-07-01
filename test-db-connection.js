const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false // Desabilita SSL
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida!');
    await client.query('SELECT NOW()');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    process.exit(1);
  }
}

testConnection();