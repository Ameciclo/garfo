const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

async function testConnection() {
  try {
    console.log('🔗 Testando conexão com o banco de dados...');
    console.log(`Host: ${process.env.POSTGRES_HOST}`);
    console.log(`Port: ${process.env.POSTGRES_PORT}`);
    console.log(`Database: ${process.env.POSTGRES_DATABASE}`);
    console.log(`User: ${process.env.POSTGRES_USER}`);
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    
    console.log('✅ Conexão bem-sucedida!');
    console.log('⏰ Timestamp do banco:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();