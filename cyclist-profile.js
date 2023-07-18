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
      const categoryNames = categoryNamesData.map(row => row.name);
      categories[categoryType] = categoryNames;
    }

    return categories;
  } catch (error) {
    console.error('Error executing SQL queries:', error);
    throw error;
  }
}

// Rota GET para "cyclist-profile"
router.get("/", async (req, res) => {
  try {
    // retorna categorias
    const categories = await getCategories();

    // Consulta para obter as edições da pesquisa com o total de questionários em cada uma
    const editionsQuery = `
      SELECT e.id, e."year", CAST(COUNT(*) AS INTEGER) AS total_questionnaires
      FROM cyclist_profile.edition e
      JOIN cyclist_profile.edition_form_data ef ON e.id = ef.edition_id
      JOIN cyclist_profile.form_data f ON ef.form_data_id = f.id
      WHERE e.city_id = 29 -- ID da cidade do Recife
      GROUP BY e.id, e."year"
    `;

    const { rows: editionsData } = await sql.query(editionsQuery);

    const editions = editionsData.map(row => ({
      id: row.id,
      year: row.year,
      total_questionnaires: row.total_questionnaires,
    }));

    res.json({ editions, categories });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
