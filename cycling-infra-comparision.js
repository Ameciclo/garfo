const osmtogeojson = require("osmtogeojson");
const axios = require("axios");
const turf = require("@turf/turf");
const OSMController = require("./OSMController");
const { OVERPASS_SERVERS, DEFAULT_BORDER_WIDTH } = require("./constants.js");
const layers = require("./layers.json");

async function addTypologyToGeoJSON(geoJson) {
  const typologyMap = getTypologyMap();

  const geoJsonWithTypology = {
    ...geoJson,
    features: geoJson.features.map((feature) => {
      const filters = getFiltersFromProperties(feature.properties);
      const typology = typologyMap[JSON.stringify(filters)] || null;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          typology,
        },
      };
    }),
  };

  return geoJsonWithTypology;
}

function getTypologyMap() {
  const typologyMap = {};
  layers.forEach((layer) => {
    if (layer.filters) {
      layer.filters.forEach((filter) => {
        const filterString = JSON.stringify(filter);
        typologyMap[filterString] = layer.name;
      });
    }
  });
  return typologyMap;
}

function getFiltersFromProperties(properties) {
  return Object.entries(properties)
    .filter(([key, value]) => value === "yes" || value === "designated")
    .map(([key]) => [key, "yes"]);
}

async function compareRefs(areaData, relationsData, pdcData) {
  try {
    const allElements = [];

    // Step 1: Process each element from relationsData
    for (const relationElement of relationsData.elements) {
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
            const total_km = turf.length(element);

            const newElementFormat = {
              relation_id: matchingPdcData ? matchingPdcData.id : null,
              osm_id: parseInt(element.id.replace("way/", "")),
              name: element.properties.name || "",
              geojson: element,
              length: total_km,
              highway: element.properties.highway || "",
            };
            allElements.push(addTypologyToGeoJSON(newElementFormat));
          }
        }
      }
    }
    // Step 4: Remove elements from areaData with ids present in relationRefs
    const relationRefs = new Set(allElements.map((element) => element.id));
    const areaDataFiltered = {
      ...areaData,
      elements: areaData.elements.filter(
        (element) => !relationRefs.has(element.id)
      ),
    };

    const areageojson = osmtogeojson(areaDataFiltered);

    // Step 5: Apply "relation_id" tag with value 257 to all elements in areaDataFiltered
    for (const element of areageojson.features) {
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
        };
        allElements.push(addTypologyToGeoJSON(newElementFormat));
      }
    }

    return allElements;
  } catch (error) {
    console.error("Error fetching data from Overpass API:", error);
    throw error;
  }
}

module.exports = compareRefs;
