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

// Função para obter o total de contagem de valores de uma categoria específica para uma edição específica
async function getCategoryCount(editionId, categoryType, categoryName) {
  try {
    const colName = categoryType + "_id";
    const categoriesCountQuery = `
      SELECT COUNT(*) AS count
      FROM cyclist_profile.edition_form_data ef
      JOIN cyclist_profile.form_data f ON ef.form_data_id = f.id
      JOIN cyclist_profile.categories c ON f.${colName} = c.id
      WHERE ef.edition_id = ${editionId}
        AND c."type" = '${categoryType}'
        AND c."name" = '${categoryName}'
    `;

    const { rows } = await sql.query(categoriesCountQuery);
    const count = rows[0].count;

    return count;
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    throw error;
  }
}

router.get("/:editionId", async (req, res) => {
  try {
    const { editionId } = req.params;
    const { filterableCategories, nonFilterableCategories } =
      await getCategories();
    const filters = req.query;
    const categories = { ...filterableCategories, ...nonFilterableCategories };

    const {
      selectedFilterableCategoriesTypes,
      notSelectedFilterableCategoriesTypes,
    } = filterCategories(filters, filterableCategories);

    const concatenatedCategoriesTypes = Object.keys(
      nonFilterableCategories
    ).concat(notSelectedFilterableCategoriesTypes);

    const categoriesCount = {};

    for (const type of concatenatedCategoriesTypes) {
      const category = categories[type];
      const categoryCount = {};
    
      for (const categoryName of category) {
        const count = await getCategoryCount(editionId, type, categoryName);
        categoryCount[categoryName] = count;
      }
    
      categoriesCount[type] = categoryCount;
    }
    

    res.json({ editionId, categoriesCount });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
