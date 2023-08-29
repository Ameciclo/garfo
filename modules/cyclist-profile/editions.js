// cyclist-profile/editions.js
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

// Função para obter todas as categorias
async function getCategories() {
  const query = `
    SELECT "type", "name", "filterable"
    FROM cyclist_profile.categories
  `;

  const client = await pool.connect(); // Conecta ao banco de dados
  try {
    const { rows } = await client.query(query);

    const filterableCategories = {};
    const nonFilterableCategories = {};

    rows.forEach((row) => {
      const { type, name, filterable } = row;

      if (filterable) {
        if (!filterableCategories[type]) {
          filterableCategories[type] = [];
        }
        filterableCategories[type].push(name);
      } else {
        if (!nonFilterableCategories[type]) {
          nonFilterableCategories[type] = [];
        }
        nonFilterableCategories[type].push(name);
      }
    });

    return { filterableCategories, nonFilterableCategories };
  } finally {
    client.release(); // Libera o cliente de conexão do banco de dados
  }
}

// Função para selecionar as categorias filtráveis com base nos filtros escolhidos
function filterCategories(filters, filterableCategories) {
  const selectedFilterableCategoriesTypes = [];

  const filterKeys = Object.keys(filters);

  for (const categoryType in filterableCategories) {
    if (filterKeys.includes(categoryType)) {
      selectedFilterableCategoriesTypes.push(categoryType);
    }
  }

  return selectedFilterableCategoriesTypes;
}

// Função para obter o total de contagem de valores de uma categoria específica para uma edição específica
async function getCategoryCount(editionId, categoryType, filterConditions) {
  const filters = filterConditions ? filterConditions : null;
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
        ${
          filters
            ? `AND ${filters
                .map(
                  ({ categoryType, filterValue }) =>
                    `f.${categoryType}_id = ${filterValue}`
                )
                .join(" AND ")} `
            : ""
        }
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

// Função para criar as condições dos filtros com base nos tipos de categorias selecionados e nos valores dos filtros
function createFilterConditions(selectedFilterableCategoriesTypes, filters) {
  let filterConditions = null;

  selectedFilterableCategoriesTypes.forEach((categoryType) => {
    if (filters.hasOwnProperty(categoryType)) {
      const filterValue = filters[categoryType];

      if (Array.isArray(filterValue)) {
        filterValue.forEach((value) => {
          filterConditions = filterConditions || [];
          filterConditions.push({
            categoryType,
            filterValue: parseInt(value),
          });
        });
      } else {
        filterConditions = filterConditions || [];
        filterConditions.push({
          categoryType,
          filterValue: parseInt(filterValue),
        });
      }
    }
  });

  return filterConditions;
}

router.get('/:editionId', async (req, res) => {
  try {
    const { editionId } = req.params;
    const { filterableCategories, nonFilterableCategories } = await getCategories();
    const filters = req.query;

    // Filtrar as categorias selecionáveis com base nos filtros escolhidos
    const selectedFilterableCategoriesTypes = filterCategories(filters, filterableCategories);

    // Apenas os tipos de categoria não filtráveis
    const nonFilterableCategoriesTypes = Object.keys(nonFilterableCategories);

    // Criar as condições dos filtros com base nos tipos de categoria selecionados e nos valores dos filtros
    const filterConditions = createFilterConditions(selectedFilterableCategoriesTypes, filters);

    const categoriesCount = {};

    // Obter o total de contagem de valores para cada tipo de categoria
    for (const type of nonFilterableCategoriesTypes) {
      const categoryCount = await getCategoryCount(editionId, type, filterConditions);
      categoriesCount[type] = categoryCount;
    }
    
    console.log(`GET /cycling-profile/editions/${editionId}: Data fetched successfully`);

    res.json({ editionId, categoriesCount });
  } catch (error) {
    console.error('Error executing SQL queries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
