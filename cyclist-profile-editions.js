const { sql } = require("@vercel/postgres");
const express = require("express");
const router = express.Router();

// Função para obter todas as categorias
async function getCategories() {
  const query = `
    SELECT "type", "name", "filterable"
    FROM cyclist_profile.categories
  `;

  const { rows } = await sql.query(query);
  const filterableCategories = {};
  const nonFilterableCategories = {};

  rows.forEach(row => {
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
}

router.get("/:editionId", async (req, res) => {
  try {
    const { editionId } = req.params;
    const { filterableCategories, nonFilterableCategories } = await getCategories();

    res.json({ editionId, filterableCategories, nonFilterableCategories });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
