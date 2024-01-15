// cyclist-infra/ways.js
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
    const waysData = await getWaysData();
    console.log("GET /cyclist-infra/ways: Data fetched successfully");
    res.json(waysData);
  } catch (error) {
    console.error("GET /cyclist-infra/ways: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

function generateCitySummary(cityData) {
  const newData = cityData.map((d) => {
    const hasCycleway = d.has_cycleway === true;
    const isNotOutPDC = d.relation_id !== 0;

    const pdc_feito = hasCycleway && isNotOutPDC ? d.length : 0;
    const out_pdc = hasCycleway && !isNotOutPDC ? d.length : 0;
    const pdc_total = isNotOutPDC ? d.length : 0;

    return {
      ...d,
      pdc_feito,
      out_pdc,
      pdc_total,
    };
  });

  const kms = newData.reduce(
    (accumulator, currentData) => {
      accumulator.pdc_feito += currentData.pdc_feito;
      accumulator.out_pdc += currentData.out_pdc;
      accumulator.pdc_total += currentData.pdc_total;
      return accumulator;
    },
    { pdc_feito: 0, out_pdc: 0, pdc_total: 0 }
  );

  const percent = kms.pdc_feito / kms.pdc_total;

  return {
    ...kms,
    percent,
  };
}

router.get("/summary", async (req, res) => {
  try {
    const waysData = await getWaysData();

    const cities = {}; // Objeto para armazenar dados por cidade

    waysData.forEach((d) => {
      if (!cities[d.city_id]) {
        cities[d.city_id] = [];
      }
      cities[d.city_id].push(d);
    });

    const summaryByCity = {};

    for (const cityId in cities) {
      if (cities.hasOwnProperty(cityId)) {
        const cityData = cities[cityId];
        const citySummary = generateCitySummary(cityData);
        summaryByCity[cityId] = citySummary;
      }
    }

    const allCityData = waysData;
    const allCitySummary = generateCitySummary(allCityData);

    console.log(
      "GET /cyclist-infra/summary: Summary data processed successfully"
    );
    res.json({ all: allCitySummary, byCity: summaryByCity });
  } catch (error) {
    console.error(
      "GET /cyclist-infra/summary: Error processing summary data:",
      error
    );
    res
      .status(500)
      .json({ error: "An error occurred while processing summary data." });
  }
});

router.get("/all-ways", async (req, res) => {
  try {
    const waysData = await getWaysData();
    const combinedData = combineFeatures(waysData);
    console.log("GET /cyclist-infra/all-ways: Data processed successfully");

    const cities = {}; // Objeto para armazenar dados por cidade

    waysData.forEach((d) => {
      if (!cities[d.city_id]) {
        cities[d.city_id] = [];
      }
      cities[d.city_id].push(d);
    });

    const combinedDataByCity = {};

    for (const cityId in cities) {
      if (cities.hasOwnProperty(cityId)) {
        const cityData = cities[cityId];
        const combinedCityData = combineFeatures(cityData);
        combinedDataByCity[cityId] = combinedCityData;
      }
    }

    const allAndByCityCombined = {
      all: combinedData,
      byCity: combinedDataByCity,
    };

    res.json(allAndByCityCombined);
  } catch (error) {
    console.error("GET /cyclist-infra/all-ways: Error processing data:", error);
    res.status(500).json({ error: "An error occurred while processing data." });
  }
});

// Função para combinar os recursos
function combineFeatures(dataArray) {
  const combinedFeatures = dataArray.map((item) => {
    let status = "NotPDC";
    if (item.relation_id !== 0)
      status = item.has_cycleway ? "Realizada" : "Projeto";
    const properties = {
      id: item.id,
      name: item.name,
      ...item.geojson.features[0].properties,
      STATUS: status,
    };
    return {
      type: "Feature",
      geometry: item.geojson.features[0].geometry,
      properties: properties,
    };
  });

  const combinedGeoJSON = {
    type: "FeatureCollection",
    features: combinedFeatures,
  };
  return combinedGeoJSON;
}

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
      city_id,
      dual_carriageway,
      pdc_typology,
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
