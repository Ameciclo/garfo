const segments = require("./city-segments.json");
const structures_rates = require("./city-structures.json");
const geojson = require("./ideciclo_ssa.json");
const { get_road_types } = require("./utils");

// Função para agrupar as estruturas por tipo de estrada
function groupStructuresByRoadType() {
  const structures = get_structures();
  const roadTypes = get_road_types();
  const groupedStructures = {};

  for (const roadType in roadTypes) {
    const highwayTypes = roadTypes[roadType].highway_types;
    groupedStructures[roadType] = structures.filter((structure) =>
      highwayTypes.includes(structure.highway)
    );
  }
  return groupedStructures;
}

function get_structures() {
  // Crie um objeto para mapear as estruturas por geo_id
  const structuresMap = {};
  // Mapeie as entradas em structures_rates
  Object.keys(structures_rates).forEach((geo_id) => {
    const ratesEntry = structures_rates[geo_id];

    // Encontre a entrada correspondente no geojson com base no geo_id
    const geojsonFeatures = geojson.features.filter(
      (feature) => feature.properties.geo_id == geo_id
    );

    if (geojsonFeatures.length > 0) {
      // Se houver correspondências no geojson, crie uma nova estrutura para cada uma
      geojsonFeatures.forEach((geojsonFeature) => {
        const structure = {
          ...ratesEntry,
          geo_id: geo_id,
          length: geojsonFeature.properties.seg_length,
          highway: geojsonFeature.properties.highway,
          typology: geojsonFeature.properties.typology,
          maxspeed: geojsonFeature.properties.maxspeed,
        };

        if (!structuresMap[geo_id]) {
          structuresMap[geo_id] = [];
        }

        structuresMap[geo_id].push(structure);
      });
    }
  });
  // Para cada geo_id, calcule a soma dos seg_length e mantenha o maior valor de maxspeed
  const structures = Object.keys(structuresMap).map((geo_id) => {
    const seg_info = segments.find((s) => s.geo_id == geo_id);

    const structuresList = structuresMap[geo_id];

    // Calcule a soma dos seg_length
    const segLengthSum = structuresList.reduce(
      (total, structure) => total + structure.length,
      0
    );

    const allHighways = [];
    structuresList.forEach((structure) => allHighways.push(structure.highway));
    // Conte os diferentes tipos de highways em allHighways
    const highwayCounts = {};
    allHighways.forEach((highway) => {
      if (!highwayCounts[highway]) {
        highwayCounts[highway] = 0;
      }
      highwayCounts[highway]++;
    });

    // Encontre o tipo de highway que mais aparece
    let mostCommonHighway = "";
    let mostCommonCount = 0;

    for (const highway in highwayCounts) {
      if (highwayCounts[highway] > mostCommonCount) {
        mostCommonHighway = highway;
        mostCommonCount = highwayCounts[highway];
      }
    }

    // Encontre o maior valor de maxspeed
    const maxspeed = Math.max(
      ...structuresList.map((structure) => structure.maxspeed)
    );

    // Retorne a estrutura agrupada
    return {
      ...seg_info,
      ...structuresList[0], // Use a primeira estrutura como base, já que as informações são idênticas
      seg_length: segLengthSum,
      maxspeed: maxspeed,
      highway: mostCommonHighway,
    };
  });

  return structures;
}

module.exports = { get_structures, groupStructuresByRoadType };
