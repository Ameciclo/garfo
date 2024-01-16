// cyclist-infra/relations-by-city.js
const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  // ssl: true,
});

const router = express.Router();
  
router.get("/", async (req, res) => {
  try {
    const citiesData = await getCitiesData();
    const waysData = await getWaysData();
    const relationsData = await getRelationsData();

    const citiesWithInfo = {};

    citiesData.forEach((city) => {
      // Inicialize o objeto da cidade em citiesWithInfo se ainda não foi inicializado
      if (!citiesWithInfo[city.id]) {
        citiesWithInfo[city.id] = {
          city_id: city.id,
          name: city.name,
          state: city.state,
          relations: []
        };
      }

      // Adicione todas as relações correspondentes a esta cidade
      relationsData.filter(relation => relation.id === city.relation_id)
                   .forEach(relation => {
        const relationWays = waysData.filter(way => way.relation_id === relation.id);
        const relationLength = relationWays.reduce((total, way) => total + way.length, 0);
        const relationHasCyclewayLength = relationWays.reduce((total, way) => way.has_cycleway ? total + way.length : total, 0);

        const typologies = relationWays.reduce((typologiesObj, way) => {
          if (way.cycleway_typology) {
            if (!typologiesObj[way.cycleway_typology]) {
              typologiesObj[way.cycleway_typology] = 0;
            }
            typologiesObj[way.cycleway_typology] += way.length;
          }
          return typologiesObj;
        }, {});

        citiesWithInfo[city.id].relations.push({
          relation_id: relation.id,
          pdc_ref: relation.pdc_ref,
          name: relation.name,
          cod_name: `(${relation.pdc_ref}) ${relation.name}`,
          length: relationLength,
          has_cycleway_length: relationHasCyclewayLength,
          pdc_typology: relation.pdc_typology,
          typologies_str: Object.keys(typologies).join(", "),
          typologies: typologies,
        });
      });
    });

    console.log("GET /cyclist-infra/relationsByCity: Data processed successfully");
    res.json(citiesWithInfo);
  } catch (error) {
    console.error("GET /cyclist-infra/relationsByCity: Error processing data:", error);
    res.status(500).json({ error: "An error occurred while processing data." });
  }
});


// Function to fetch ways data from the database
async function getWaysData() {
  try {
    const query = `
      SELECT osm_id,
      "name",
      length,
      has_cycleway,
      cycleway_typology,
      relation_id
      FROM cyclist_infra.ways
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching ways data:", error);
    throw new Error("An error occurred while fetching ways data.");
  }
}

async function getCitiesData() {
  try {
    const query = `
      SELECT c.id,
      c.name,
      c.state,
      rc.relation_id
      FROM public.cities AS c
      INNER JOIN cyclist_infra.relation_cities AS rc
      ON c.id = rc.cities_id
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching cities data:", error);
    throw new Error("An error occurred while fetching cities data.");
  }
}

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
