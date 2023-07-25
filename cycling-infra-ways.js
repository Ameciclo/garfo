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
async function getWaysData() {
  try {
    const query = `
      SELECT osm_id,
      name,
      length,
      highway,
      has_cycleway,
      cycleway_typology,
      relation_id,
      geojson,
      lastupdated
      FROM cycling_infra.ways
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

module.exports = { getWaysData };
