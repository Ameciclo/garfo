// cycling-infra-relations.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

// Function to fetch relations data from the database
async function getRelationsData() {
  try {
    const query = `
      SELECT id,
      name,
      pdc_ref,
      pdc_notes,
      pdc_typology,
      total_km,
      pdc_km,
      pdc_stretch,
      pdc_cities,
      osm_id
      FROM cycling_infra.relations
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

module.exports = { getRelationsData };
