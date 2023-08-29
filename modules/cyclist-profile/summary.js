// cyclist-profile/summary.js
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

// retorna categorias
async function getCategories() {
  const categories = {};
  const client = await pool.connect(); // Conecta ao banco de dados

  try {
    // Consulta para obter as categorias únicas da tabela cyclist_profile.categories
    const categoriesQuery = `
      SELECT DISTINCT "type"
      FROM cyclist_profile.categories
    `;

    const { rows: categoriesData } = await client.query(categoriesQuery);

    for (const row of categoriesData) {
      const categoryType = row.type;
      const categoryNamesQuery = `
        SELECT "name"
        FROM cyclist_profile.categories
        WHERE "type" = '${categoryType}'
      `;
      const { rows: categoryNamesData } = await client.query(categoryNamesQuery);
      const categoryNames = categoryNamesData.map((row) => row.name);
      categories[categoryType] = categoryNames;
    }

    return categories;
  } finally {
    client.release(); // Libera o cliente de conexão do banco de dados
  }
}

// Função para obter o total de contagem de valores de uma categoria específica para uma edição específica
async function getCategoryCount(editionId, categoryType) {
  const colName = categoryType + "_id";
  const client = await pool.connect(); // Conecta ao banco de dados

  try {
    const categoriesCountQuery = `
      SELECT f.${colName}, COUNT(*) AS count
      FROM cyclist_profile.edition_form_data ef
      JOIN cyclist_profile.form_data f ON ef.form_data_id = f.id
      JOIN cyclist_profile.categories c ON f.${colName} = c.id
      WHERE ef.edition_id = ${editionId}
        AND c."type" = '${categoryType}'
      GROUP BY f.${colName}
    `;

    const { rows } = await client.query(categoriesCountQuery);
    const categoryCount = {};

    rows.forEach((row) => {
      const { [colName]: category, count } = row;
      categoryCount[category] = parseInt(count);
    });

    return categoryCount;
  } finally {
    client.release(); // Libera o cliente de conexão do banco de dados
  }
}

router.get('/', async (req, res) => {
  try {
    const categories = await getCategories();

    const editionsQuery = `
      SELECT e.id, e."year", CAST(COUNT(*) AS INTEGER) AS total_questionnaires
      FROM cyclist_profile.edition e
      JOIN cyclist_profile.edition_form_data ef ON e.id = ef.edition_id
      JOIN cyclist_profile.form_data f ON ef.form_data_id = f.id
      WHERE e.city_id = 29
      GROUP BY e.id, e."year"
    `;

    const client = await pool.connect(); // Conecta ao banco de dados

    try {
      const { rows: editionsData } = await client.query(editionsQuery);

      const editions = await Promise.all(
        editionsData.map(async (row) => {
          const editionId = row.id;
          const categoriesCount = {};

          for (const categoryType in categories) {
            const count = await getCategoryCount(editionId, categoryType);
            categoriesCount[categoryType] = count;
          }

          return {
            id: editionId,
            year: row.year,
            total_questionnaires: row.total_questionnaires,
            categories: categoriesCount,
          };
        })
      );
      console.log("GET /cycling-profile/: Data fetched successfully");

      res.json({ editions, categories });
    } finally {
      client.release(); // Libera o cliente de conexão do banco de dados
    }
  } catch (error) {
    console.error('Error executing SQL queries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
