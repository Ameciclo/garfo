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
}

// Função para selecionar as categorias filtráveis com base nos filtros escolhidos
function filterCategories(filters, filterableCategories) {
  const selectedFilterableCategoriesTypes = [];
  const notSelectedFilterableCategoriesTypes = [];

  const filterKeys = Object.keys(filters);

  for (const categoryType in filterableCategories) {
    if (filterKeys.includes(categoryType)) {
      selectedFilterableCategoriesTypes.push(categoryType);
    } else {
      notSelectedFilterableCategoriesTypes.push(categoryType);
    }
  }

  return {
    selectedFilterableCategoriesTypes,
    notSelectedFilterableCategoriesTypes,
  };
}

router.get("/:editionId", async (req, res) => {
  try {
    const { editionId } = req.params;
    const { filterableCategories, nonFilterableCategories } =
      await getCategories();
    const filters = req.query;

    const {
      selectedFilterableCategoriesTypes,
      notSelectedFilterableCategoriesTypes,
    } = filterCategories(filters, filterableCategories);

    const concatenatedCategoriesTypes = Object.keys(nonFilterableCategories).concat(
      notSelectedFilterableCategoriesTypes
    );

    console.log(
      selectedFilterableCategoriesTypes,
      concatenatedCategoriesTypes,
      filters
    );

    

    res.json({ editionId });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
