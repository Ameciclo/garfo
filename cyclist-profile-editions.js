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
async function getCategoryCount(editionId, categoryType, filterConditions) {
  const filters = filterConditions ? filterConditions : null;
  try {
    const colName = categoryType + "_id";
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

    const { rows } = await sql.query(categoriesCountQuery);
    const categoryCount = {};

    rows.forEach((row) => {
      const { [colName]: category, count } = row;
      categoryCount[category] = count;
    });

    return categoryCount;
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    throw error;
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

router.get("/:editionId", async (req, res) => {
  try {
    const { editionId } = req.params;
    const { filterableCategories, nonFilterableCategories } =
      await getCategories();
    const filters = req.query;
    const categories = { ...filterableCategories, ...nonFilterableCategories };

    // Filtrar as categorias selecionáveis com base nos filtros escolhidos
    const {
      selectedFilterableCategoriesTypes,
      notSelectedFilterableCategoriesTypes,
    } = filterCategories(filters, filterableCategories);

    // Concatenar os tipos de categoria não filtráveis com os tipos não selecionados das categorias filtráveis
    const concatenatedCategoriesTypes = Object.keys(nonFilterableCategories).concat(
      notSelectedFilterableCategoriesTypes
    );

    // Criar as condições dos filtros com base nos tipos de categoria selecionados e nos valores dos filtros
    const filterConditions = createFilterConditions(
      selectedFilterableCategoriesTypes,
      filters
    );

    const categoriesCount = {};

    // Obter o total de contagem de valores para cada tipo de categoria
    for (const type of concatenatedCategoriesTypes) {
      const categoryCount = await getCategoryCount(
        editionId,
        type,
        filterConditions
      );
      categoriesCount[type] = categoryCount;
    }

    res.json({ editionId, categoriesCount });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;