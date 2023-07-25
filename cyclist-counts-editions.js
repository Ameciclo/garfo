// cyclist-counts-editions.js
const { Pool } = require('pg'); // Importa a biblioteca pg para lidar com o PostgreSQL
const express = require('express');
const router = express.Router();

// Configure as informações de conexão com o banco de dados
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Nome de usuário do banco de dados
  host: process.env.POSTGRES_HOST, // Endereço do host do banco de dados
  database: process.env.POSTGRES_DATABASE, // Nome do banco de dados
  password: process.env.POSTGRES_PASSWORD, // Senha do banco de dados
  port: process.env.POSTGRES_PORT, // Porta para se conectar ao banco de dados
  ssl: true // Define o uso de SSL para conexão segura (isso depende das configurações do servidor PostgreSQL)
});

// Rota GET para "cyclist-counts-editions"
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
      WHERE
        e.id = ${id}
    `;

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
      WHERE
        cc.edition_id = ${id}
      GROUP BY
        cc.edition_id
    `;

    const client = await pool.connect(); // Conecta ao banco de dados

    console.log(`conectado à ${process.env.POSTGRES_DATABASE}`);

    try {
      // Executa as consultas no banco de dados
      const { rows: characteristicsData } = await client.query(characteristicsQuery);
      const { rows: summaryData } = await client.query(summaryQuery);

      if (summaryData.length === 0) {
        return res.status(404).json({ error: 'Edition not found' });
      }

      const total = summaryData[0].total_cyclists;
      const last_count = summaryData[0].date;
      const number_counts = summaryData.length;
      const different_counts_points = 1; // Neste endpoint, sempre será 1 ponto de contagem
      const max_total_of_count = total;
      const where_max_count = summaryData[0];

      const formattedCounts = summaryData.map(count => {
        const countCharacteristics = characteristicsData[0];

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

      const characteristicsSums = {};
      formattedCounts.forEach(count => {
        Object.keys(count).forEach(key => {
          if (key.startsWith('total_')) {
            if (!characteristicsSums[key]) {
              characteristicsSums[key] = 0;
            }
            characteristicsSums[key] += parseInt(count[key]);
          }
        });
      });

      const summary = {
        total,
        last_count,
        number_counts,
        different_counts_points,
        max_total_of_count,
        where_max_count,
        ...characteristicsSums,
      };

      const data = {
        summary,
        counts: formattedCounts,
      };

      res.json(data);
    } finally {
      client.release(); // Libera o cliente de conexão do banco de dados
    }
  } catch (error) {
    console.error('Error executing SQL queries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
