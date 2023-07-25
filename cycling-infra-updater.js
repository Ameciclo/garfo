// cycling-infra-updater.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

async function fetchInfrastructureData(comparisonResult) {
  try {
    // ... (rest of the code)

    // Call the compareExistingWithProjectedCyclingInfrastruture function
    //const comparisonResult = await compareExistingWithProjectedCyclingInfrastruture(existing, projected, pdcData);

    // Insert the data from comparisonResult into the cycling_infra.ways table
    await insertWaysData(comparisonResult);

    console.log("Fetch concluído com sucesso!");
  } catch (error) {
    console.error("Ocorreu um erro ao buscar e preencher os dados:", error);
  } finally {
    pool.end(); // Encerre a conexão do pool com o banco de dados
  }
}

// Função auxiliar para inserir os dados das ways no banco de dados
async function insertWaysData(waysData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const wayData of waysData) {
      const osmId = wayData.osm_id;
      const name = wayData.name;
      const length = wayData.length;
      const highway = wayData.highway;
      const hasCycleway = wayData.has_cycleway;
      const cyclewayTypology = wayData.cycleway_typology;
      const relationId = wayData.relation_id;
      const geojson = wayData.geojson;
      const lastUpdated = new Date(); // Adicione a data atual como lastUpdated

      const query = `
        INSERT INTO cycling_infra.ways (osm_id, name, length, highway, has_cycleway, cycleway_typology, relation_id, geojson, lastupdated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (osm_id) DO NOTHING
      `;
      await client.query(query, [
        osmId,
        name,
        length,
        highway,
        hasCycleway,
        cyclewayTypology,
        relationId,
        geojson,
        lastUpdated, // Adicione lastUpdated na inserção
      ]);
      console.debug(`inserted or updated ${wayData.osm_id} - ${wayData.name}`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = fetchInfrastructureData;
