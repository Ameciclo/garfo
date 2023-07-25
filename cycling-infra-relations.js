// cycling-infra-relations.js
const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

// Route to list relations that do not have the total_km field filled
router.get("/", async (req, res) => {
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
    res.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

module.exports = router;
