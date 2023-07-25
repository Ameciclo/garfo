// cyclist-count.js
const { Pool } = require('pg'); // Importa a biblioteca pg para lidar com o PostgreSQL
const express = require('express');
const router = express.Router(); // Cria um roteador para definir as rotas

// Configure as informações de conexão com o banco de dados
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Nome de usuário do banco de dados
  host: process.env.POSTGRES_HOST, // Endereço do host do banco de dados
  database: process.env.POSTGRES_DATABASE, // Nome do banco de dados
  password: process.env.POSTGRES_PASSWORD, // Senha do banco de dados
  port: process.env.POSTGRES_PORT, // Porta para se conectar ao banco de dados
  ssl: true // Define o uso de SSL para conexão segura (isso depende das configurações do servidor PostgreSQL)
});

// Rota GET para "cyclist-count"
router.get('/', async (req, res) => {
  try {
    // Consulta SQL para obter informações sobre as contagens de ciclistas e suas características
    const summaryQuery = `
      SELECT
        e.id,
        e.name,
        CAST((SELECT SUM(dc.count) FROM cyclist_count.direction_counts dc JOIN cyclist_count.session s ON dc.session_id = s.id WHERE s.edition_id = e.id) AS INTEGER) AS total_cyclists,
        e.date,
        c.point AS coordinates
      FROM
        cyclist_count.edition e
      JOIN
        public.coordinates c ON e.coordinates_id = c.id
      ORDER BY e.id ASC
    `;

    // Consulta SQL para obter informações sobre as características das contagens de ciclistas
    const characteristicsQuery = `
      SELECT cc.edition_id,
        CAST(SUM(CASE WHEN ch.type = 'cargo' THEN cc.count ELSE 0 END) AS INTEGER) AS total_cargo,
        CAST(SUM(CASE WHEN ch.type = 'helmet' THEN cc.count ELSE 0 END) AS INTEGER) AS total_helmet,
        CAST(SUM(CASE WHEN ch.type = 'juveniles' THEN cc.count ELSE 0 END) AS INTEGER) AS total_juveniles,
        CAST(SUM(CASE WHEN ch.type = 'motor' THEN cc.count ELSE 0 END) AS INTEGER) AS total_motor,
        CAST(SUM(CASE WHEN ch.type = 'ride' THEN cc.count ELSE 0 END) AS INTEGER) AS total_ride,
        CAST(SUM(CASE WHEN ch.type = 'service' THEN cc.count ELSE 0 END) AS INTEGER) AS total_service,
        CAST(SUM(CASE WHEN ch.type = 'shared_bike' THEN cc.count ELSE 0 END) AS INTEGER) AS total_shared_bike,
        CAST(SUM(CASE WHEN ch.type = 'sidewalk' THEN cc.count ELSE 0 END) AS INTEGER) AS total_sidewalk,
        CAST(SUM(CASE WHEN ch.type = 'women' THEN cc.count ELSE 0 END) AS INTEGER) AS total_women,
        CAST(SUM(CASE WHEN ch.type = 'wrong_way' THEN cc.count ELSE 0 END) AS INTEGER) AS total_wrong_way
      FROM
        cyclist_count.characteristics_count cc
      JOIN
        cyclist_count.characteristics ch ON cc.characteristics_id = ch.id
      GROUP BY
        cc.edition_id
    `;

    const client = await pool.connect(); // Conecta ao banco de dados

    console.log(`conectado à ${process.env.POSTGRES_DATABASE}`);

    try {
      // Executa as consultas no banco de dados
      const summaryResult = await client.query(summaryQuery);
      const characteristicsResult = await client.query(characteristicsQuery);

      const summaryData = summaryResult.rows; // Dados obtidos da consulta de resumo
      const characteristicsData = characteristicsResult.rows; // Dados obtidos da consulta de características

      // Calcula algumas estatísticas com base nos dados das contagens de ciclistas
      const total = summaryData.reduce((acc, row) => acc + parseInt(row.total_cyclists), 0);
      const last_count = summaryData[0].date;
      const number_counts = summaryData.length;
      const different_counts_points = new Set(summaryData.map((row) => row.name)).size;
      const max_total_of_count = Math.max(...summaryData.map((row) => parseInt(row.total_cyclists)));
      const where_max_count = summaryData.find((row) => parseInt(row.total_cyclists) === max_total_of_count);

      // Formata os dados das contagens de ciclistas para adicionar um slug e suas características
      const formattedCounts = summaryData.map((count) => {
        const countCharacteristics = characteristicsData.find((char) => char.edition_id === count.id);

        const slugName = count.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-')
          .toLowerCase();

        const slugDate = new Date(count.date).toISOString().slice(0, 10);
        const slug = `${count.id}-${slugDate}-${slugName}`;

        return {
          ...count,
          ...countCharacteristics,
          slug,
        };
      });

      // Calcula as somas das características de todas as contagens
      const characteristicsSums = {};
      formattedCounts.forEach((count) => {
        Object.keys(count).forEach((key) => {
          if (key.startsWith('total_')) {
            if (!characteristicsSums[key]) {
              characteristicsSums[key] = 0;
            }
            characteristicsSums[key] += parseInt(count[key]);
          }
        });
      });

      // Cria um objeto com as informações de resumo e os dados das contagens formatadas
      const summary = {
        total,
        last_count,
        number_counts,
        different_counts_points,
        max_total_of_count,
        where_max_count,
        ...characteristicsSums,
      };

      // Cria um objeto final contendo o resumo e os dados das contagens formatadas
      const data = {
        summary: summary,
        counts: formattedCounts,
      };

      res.status(200).json(data); // Retorna os dados como resposta da requisição HTTP
    } finally {
      client.release(); // Libera o cliente de conexão do banco de dados
    }
  } catch (error) {
    console.error('Error executing SQL queries:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Em caso de erro, retorna uma resposta de erro do servidor
  }
});

module.exports = router; // Exporta o roteador para ser utilizado em outras partes da aplicação
