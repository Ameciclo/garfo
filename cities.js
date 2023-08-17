// cyclist-count.js
const { Pool } = require("pg"); // Importa a biblioteca pg para lidar com o PostgreSQL
const express = require("express");
const router = express.Router(); // Cria um roteador para definir as rotas

// Configure as informações de conexão com o banco de dados
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Nome de usuário do banco de dados
  host: process.env.POSTGRES_HOST, // Endereço do host do banco de dados
  database: process.env.POSTGRES_DATABASE, // Nome do banco de dados
  password: process.env.POSTGRES_PASSWORD, // Senha do banco de dados
  port: process.env.POSTGRES_PORT, // Porta para se conectar ao banco de dados
  ssl: true, // Define o uso de SSL para conexão segura (isso depende das configurações do servidor PostgreSQL)
});

// Rota GET para "cyclist-count"
router.get("/", async (req, res) => {
  try {
    const query = `
        SELECT id,
        name,
        state
        FROM public.cities
    `;

    const client = await pool.connect(); // Conecta ao banco de dados

    console.log(`conectado à ${process.env.POSTGRES_DATABASE}`);

    try {
      // Executa as consultas no banco de dados
      const citiesResult = await client.query(query);
      const data = citiesResult.rows; // Dados obtidos da consulta de resumo

      console.log(
        "GET /cycling-infra/cyclist-counts: Data fetched successfully"
      );

      res.status(200).json(data); // Retorna os dados como resposta da requisição HTTP
    } finally {
      client.release(); // Libera o cliente de conexão do banco de dados
    }
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" }); // Em caso de erro, retorna uma resposta de erro do servidor
  }
});

module.exports = router; // Exporta o roteador para ser utilizado em outras partes da aplicação
