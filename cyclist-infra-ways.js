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

router.get("/", async (req, res) => {
  try {
    const waysData = await getWaysData();
    console.log("GET /cyclist-infra/ways: Data fetched successfully");
    res.json(waysData);
  } catch (error) {
    console.error("GET /cyclist-infra/ways: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
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
      FROM cyclist_infra.ways
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

module.exports = router;
