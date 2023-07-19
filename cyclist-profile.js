const { sql } = require("@vercel/postgres");
const express = require("express");
const router = express.Router();

// retorna categorias
async function getCategories() {
  try {
    // Consulta para obter as categorias únicas da tabela cyclist_profile.categories
    const categoriesQuery = `
      SELECT DISTINCT "type"
      FROM cyclist_profile.categories
    `;

    const { rows: categoriesData } = await sql.query(categoriesQuery);

    const categories = {};
    for (const row of categoriesData) {
      const categoryType = row.type;
      const categoryNamesQuery = `
        SELECT "name"
        FROM cyclist_profile.categories
        WHERE "type" = '${categoryType}'
      `;
      const { rows: categoryNamesData } = await sql.query(categoryNamesQuery);
      const categoryNames = categoryNamesData.map((row) => row.name);
      categories[categoryType] = categoryNames;
    }

    return categories;
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    throw error;
  }
}

// Função para obter o total de contagem de valores de uma categoria específica para uma edição específica
async function getCategoryCount(editionId, categoryType) {
  try {
    const colName = categoryType + "_id";

    const categoriesCountQuery = `
        SELECT f.${colName}, COUNT(*) AS count
        FROM cyclist_profile.edition_form_data ef
        JOIN cyclist_profile.form_data f ON ef.form_data_id = f.id
        JOIN cyclist_profile.categories c ON f.${colName} = c.id
        WHERE ef.edition_id = ${editionId}
          AND c."type" = '${categoryType}'
        GROUP BY f.${colName}
      `;

    const { rows } = await sql.query(categoriesCountQuery);
    const categoryCount = {};

    rows.forEach((row) => {
      const { [colName]: category, count } = row;
      categoryCount[category] = parseInt(count);
    });

    return categoryCount;
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    throw error;
  }
}

router.get("/", async (req, res) => {
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

    const { rows: editionsData } = await sql.query(editionsQuery);

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

    res.json({ editions, categories });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
