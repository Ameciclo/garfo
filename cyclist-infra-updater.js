// cyclist-infra-updater.js
const express = require("express");
const { Pool } = require("pg");
const osmtogeojson = require("osmtogeojson");
const axios = require("axios");
const turf = require("@turf/turf");
const OSMController = require("./OSMController");
const { OVERPASS_SERVERS } = require("./constants.js");
const layers = require("./layers.json");

require("dotenv").config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

const router = express.Router();

//OK Route to use the data from comparePDConRMR function
router.get("/", async (req, res) => {
  try {
    const comparadeData = await comparePDConRMR();
    console.log("GET /cyclist-infra/update: UPDATE successfully");
    res.json(comparadeData);
  } catch (error) {
    console.error("GET /cyclist-infra/relations: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

//OK Function to fetch relations data from the database
async function getOSMIdFromRelations() {
  try {
    const query = `
      SELECT id,
      name,
      osm_id
      FROM cyclist_infra.relations
    `;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

// Function to compare existing infrastructure on the area with project on relations
async function compareExistingInfrastrutureOnAreaWithProjectOnRelations(
  existing,
  projected
) {
  try {
    const allElements = [];

    /* // Step 1: Process each element from relationsData
    for (const relationElement of projected.elements) {
      const relationRefs = new Set();
      for (const relationMember of relationElement.members) {
        relationRefs.add(relationMember.ref);
      }
 
      // Step 3: Add "relation_id" tag to each element in relationsWays
      if (relationsWays) {
        const geojson = osmtogeojson(relationsWays);
        for (const element of geojson.features) {
          const id = element.id;
          if (id.startsWith("way/")) {
            const pdcData = relationElement.pdcData;
            // Calculate the total kilometers using turf.length()
            let dual_carriage = false;
            if (element.properties.dual_carriageway)
              dual_carriage =
                element.properties.dual_carriageway == "yes" ? true : false;
            const total_km = turf.length(element);
            const typology = getTypologyFromGeoJSON(element.properties);
            const newElementFormat = {
              relation_id: pdcData ? pdcData.id : null,
              osm_id: parseInt(element.id.replace("way/", "")),
              name: element.properties.name || "",
              geojson: element,
              length: total_km,
              highway: element.properties.highway || "",
              cycleway_typology: typology || "",
              has_cycleway: typology != "none" ? true : false,
              dual_carriageway: dual_carriage,
            };
            allElements.push(newElementFormat);
          }
        }
      }
    }
    // Step 4: Remove elements from areaData with ids present in relationRefs
    const relationRefs = new Set(allElements.map((element) => element.id));
    const areaDataFiltered = {
      ...existing,
      elements: existing.elements.filter(
        (element) => !relationRefs.has(element.id)
      ),
    };

    const areageojson = osmtogeojson(areaDataFiltered);

    // Step 5: Apply "relation_id" tag with value 257 to all elements in areaDataFiltered
    for (const element of areageojson.features) {
      let dual_carriage = false;
      if (element.properties.dual_carriageway)
        dual_carriage =
          element.properties.dual_carriageway == "yes" ? true : false;
      const id = element.id;
      // Calculate the total kilometers using turf.length()
      const total_km = turf.length(element);
      if (id.startsWith("way/")) {
        const newElementFormat = {
          relation_id: 257,
          osm_id: parseInt(element.id.replace("way/", "")),
          name: element.properties.name || "",
          geojson: element,
          length: total_km,
          highway: element.properties.highway || "",
          has_cycleway: true,
          dual_carriageway: dual_carriage,
          cycleway_typology: getTypologyFromGeoJSON(element.properties) || "",
        };
        allElements.push(newElementFormat);
      }
    }
    // console.log(typologyList)
    // return allElements; */

    return { existing, projected };
  } catch (error) {
    console.error("Error fetching data from Overpass API:", error);
    throw error;
  }
}

// Function to update infrastructure data
async function updateInfraData(comparisonResult) {
  try {
    // Insert the data from comparisonResult into the cyclist_infra.ways table
    await insertWaysData(comparisonResult);

    console.log("Fetch concluído com sucesso!");
  } catch (error) {
    console.error("Ocorreu um erro ao buscar e preencher os dados:", error);
  } finally {
    pool.end(); // Encerre a conexão do pool com o banco de dados
  }
}
// Function to insert the data of ways into the database
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
        INSERT INTO cyclist_infra.ways (osm_id, name, length, highway, has_cycleway, cycleway_typology, relation_id, geojson, lastupdated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (osm_id) DO UPDATE
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

async function comparePDConRMR() {
  // Call the getOSMIdFromRelations() function to get the osm_id array
  const pdcData = await getOSMIdFromRelations();
  const pdcOsmIds = pdcData.map((relation) => relation.osm_id);
  const notNullPdcOsmIds = pdcOsmIds.filter((osmId) => osmId !== null);

  // Call the OSMController.getWaysOSMJsonFromRelationsIds() method to fetch the OSM data
  const pdcWaysData = await OSMController.getRelationJsonFromIds(
    notNullPdcOsmIds
  );

  // Map pdcData to include the relevant data for each element in pdcWaysData
  const pdcDataMappedPromises = pdcWaysData.elements.map(async (element) => {
    const matchingPdcData = pdcData.find((data) =>
      data.osm_id ? data.osm_id === element.id : null
    );
    const waysIds = element.members
      .filter((member) => member.type === "way")
      .map((member) => member.ref);

    const ways = await OSMController.getOSMJsonWaysFromWaysIds(waysIds);
    const tags = {
      ...element.tags,
      matchingPdcData,
    };

    return {
      ...element,
      members: ways.elements,
      tags: tags,
    };
  });

  // Resolve all promises using Promise.all
  const pdcDataMapped = await Promise.all(pdcDataMappedPromises);

  // Call the OSMController.getOSMAreaData() method to fetch the OSM data
  const rmrCycleWaysData = await OSMController.getCycleWaysOSMJsonFromArea({
    area: "Região Metropolitana do Recife",
  });

  const fakeRelationOfRemainData = [{ members: rmrCycleWaysData.elements }];

  return compareExistingInfrastrutureOnAreaWithProjectOnRelations(
    rmrCycleWaysData,
    pdcDataMapped
  );
}

// Function to get typology map from layers
function getTypologyMap() {
  const typologyMap = {};
  layers.forEach((layer) => {
    if (layer.filters) {
      layer.filters.forEach((filter) => {
        let filterString;
        if (Array.isArray(filter[0])) {
          filterString = filter[0].join("=");
        } else {
          filterString = filter.join("=");
        }
        typologyMap[filterString] = {
          name: layer.name,
          composed: Array.isArray(filter[0]) ? filter[0].join("=") : false,
        };
      });
    }
  });
  return typologyMap;
}

// Function to get typology from GeoJSON properties
function getTypologyFromGeoJSON(geoJsonProperties) {
  const typologyMap = getTypologyMap();
  return getFiltersFromProperties(geoJsonProperties);
}

// Function to get filters from properties
function getFiltersFromProperties(properties) {
  const typologyMap = getTypologyMap();
  const filters = Object.entries(properties).map(([key, value]) => {
    const filterString = `${key}=${value}`;
    if (typologyMap[filterString]) {
      const { composed } = typologyMap[filterString];
      if (composed) {
        // Check if any property matches the composed filter
        const matchesComposed = Object.entries(properties).some(
          ([propKey, propValue]) => composed === `${propKey}=${propValue}`
        );

        // If there is a match, return the typology name
        if (matchesComposed) {
          return typologyMap[filterString].name;
        }
      } else {
        return typologyMap[filterString].name;
      }
    }
  });
  // If no match was found, return "none"
  const filteredFilters = filters.filter(Boolean);
  return filteredFilters.length > 0 ? filteredFilters[0] : "none";
}

module.exports = router;
