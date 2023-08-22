// osm-db-insert.js
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to the database!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

async function insertWaysData(wayData) {
  try {
    for (const element of wayData.elements) {
      // Defina as colunas que deseja inserir/atualizar na tabela "cycling_infra.ways"
      const columns = [
        "osm_id",
        "name",
        "length",
        "highway",
        "has_cycleway",
        "cycleway_typology",
        "relation_id",
        "geojson",
      ];

      // Monta a query de inserção/atualização com a cláusula ON CONFLICT DO UPDATE
      const query = `
          INSERT INTO cycling_infra.ways (${columns.join(", ")})
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (osm_id) DO UPDATE
          SET name = EXCLUDED.name,
              length = EXCLUDED.length,
              highway = EXCLUDED.highway,
              has_cycleway = EXCLUDED.has_cycleway,
              cycleway_typology = EXCLUDED.cycleway_typology,
              relation_id = EXCLUDED.relation_id,
              geojson = EXCLUDED.geojson;
        `;

      // Extrai os valores dos elementos para a query
      const values = columns.map((col) => element[col]);

      // Executa a query
      await client.query(query, values);
    }

    console.log("Data inserted/updated in cycling_infra.ways!");
  } catch (error) {
    console.error(
      "Error inserting/updating data into cycling_infra.ways:",
      error
    );
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  insertWaysData,
};
