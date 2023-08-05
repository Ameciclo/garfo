const express = require("express");

const osmtogeojson = require("osmtogeojson");
const axios = require("axios");
const turf = require("@turf/turf");
const OSMController = require("./OSMController");
const { OVERPASS_SERVERS } = require("./constants.js");
const layers = require("./layers.json");
const { getRelationsData } = require("./cyclist-infra-relations.js");

const router = express.Router();

// Route to fetch PDC data
router.get("/", async (req, res) => {
  try {
    // Call the comparePDConRMR() function to compare the data
    const comparisonResult = await comparePDConRMR();
    console.log("GET /cycling-infra/update: Data comparison completed");
    //await updateInfraData(comparisonResult);
    // Send the retrieved data as a response
    res.json(comparisonResult);
  } catch (error) {
    console.error("GET /cycling-infra/update: Error fetching OSM data:", error);
    res.status(500).json({ error: "Error fetching OSM data" });
  }
});


function getTypologyFromGeoJSON(geoJsonProperties) {
  const typologyMap = getTypologyMap();
  return getFiltersFromProperties(geoJsonProperties);
}

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

async function compareExistingInfrastrutureOnAreaWithProjectOnRelations(
  existing,
  projected,
  pdcData
) {
  try {
    const allElements = [];

    // Step 1: Process each element from relationsData
    for (const relationElement of projected.elements) {
      const relation_id = relationElement.id;
      const relationRefs = new Set();
      for (const relationMember of relationElement.members) {
        relationRefs.add(relationMember.ref);
      }

      // Step 2: Query Overpass Turbo with relationRefs
      const query = OSMController.getMultipleWaysQuery([
        Array.from(relationRefs),
      ]);
      console.debug("generated query:", query);
      const encodedQuery = encodeURI(query);
      let relationsWays = null;

      for (let i = 0; i < OVERPASS_SERVERS.length; i++) {
        const endpoint = OVERPASS_SERVERS[i] + "?data=" + encodedQuery;
        console.debug(`[SERVER #${i}] ${OVERPASS_SERVERS[i]}`);
        try {
          const response = await axios.get(endpoint);
          if (response.status === 200 && response.data.elements.length > 0) {
            console.debug(`[SERVER #${i}] Success!`);
            relationsWays = response.data;
            break; // Stop iterating servers once we get data
          } else {
            console.debug(`[SERVER #${i}] Empty result`);
          }
        } catch (error) {
          console.error(`[SERVER #${i}] Error:`, error);
        }
      }

      // Step 3: Add "relation_id" tag to each element in relationsWays
      if (relationsWays) {
        const geojson = osmtogeojson(relationsWays);
        for (const element of geojson.features) {
          const id = element.id;
          if (id.startsWith("way/")) {
            const matchingPdcData = pdcData.find(
              (data) => data.osm_id === relation_id
            );
            // Calculate the total kilometers using turf.length()
            let dual_carriage = false;
            if (element.properties.dual_carriageway)
              dual_carriage =
                element.properties.dual_carriageway == "yes" ? true : false;
            const total_km = turf.length(element);
            const typology = getTypologyFromGeoJSON(element.properties);
            const newElementFormat = {
              relation_id: matchingPdcData ? matchingPdcData.id : null,
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
    return allElements;
  } catch (error) {
    console.error("Error fetching data from Overpass API:", error);
    throw error;
  }
}
async function comparePDConRMR() {
  try {
    // Call the getRelationsData() function to get the osm_id array
    const pdcData = await getRelationsData();
    const osmIds = pdcData.map((relation) => relation.osm_id);
    const filteredOsmIds = osmIds.filter((osmId) => osmId !== null);

    // Call the OSMController.getWaysOSMJsonFromRelationsIds() method to fetch the OSM data
    const relationsData = await OSMController.getWaysOSMJsonFromRelationsIds(filteredOsmIds);

    const constraints = {
      area: "Região Metropolitana do Recife", // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };
    // Call the OSMController.getOSMAreaData() method to fetch the OSM data
    const areaData = await OSMController.getCycleWaysOSMJsonFromArea(constraints);
    return compareExistingInfrastrutureOnAreaWithProjectOnRelations(areaData, relationsData, pdcData);
  } catch (error) {
    console.error("Error in comparePDConRMR:", error);
    throw error; // Re-throw the error to propagate it to the caller or handle it as needed.
  }
}
module.exports = router;
