// cyclist-infra-relations.js
const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

const router = express.Router();

// Route to use the data from getRelationsData function
router.get("/", async (req, res) => {
  try {
    const relationsData = await getRelationsData();
    console.log("GET /cyclist-infra/relations: Data fetched successfully");
    res.json(relationsData);
  } catch (error) {
    console.error("GET /cyclist-infra/relations: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
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
      pdc_km,
      pdc_stretch,
      pdc_cities,
      osm_id,
      notes
      FROM cyclist_infra.relations
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

module.exports = router;
