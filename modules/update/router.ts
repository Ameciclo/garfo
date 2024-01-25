// import express, { Request, Response } from "express";
// import { db } from "../../db";
// import * as schema from "../../db/migration/schema";
// import * as OSMController from "../../commons/osm-controller";
// import osmtogeojson from "osmtogeojson";
// import * as turf from "@turf/turf";
// import layers from "../../commons/layers.json";
// import rmrCities from "../../commons/pe-cities.json";

// const router = express.Router();

// interface RelationData {
//   id: number;
//   name: string | null;
//   pdcRef: string | null;
//   pdcNotes: string | null;
//   pdcTypology: string | null;
//   pdcKm: number | null;
//   pdcStretch: string | null;
//   pdcCities: string | null;
//   osmId: number | null;
//   notes: string | null;
// }

// interface Member {
//   id: number;
//   geometry: { lat: number; lon: number }[];
//   tags: {
//     name?: string;
//     dual_carriageway?: string;
//     highway?: string;
//     [key: string]: any;
//   };
//   type: string;
// }

// interface Element {
//   type: string;
//   id: null;
//   members: OSMElement[];
//   tags: {
//     name: string;
//   };
//   pdc: RelationData | undefined;
// }

// interface City {
//   id: number;
//   name: string;
//   state: string;
// }

// interface Layer {
//   name: string;
//   filters: (string | string[])[]; // Adjust this based on the actual structure of filters in your layers
// }

// interface TypologyMap {
//   [key: string]: {
//     name: string;
//     composed: string | false;
//   };
// }

// interface CityJson {
//   features: Feature[];
// }

// interface Feature {
//   properties: {
//     name: string;
//   };
//   // Add other relevant properties of a feature
// }

// interface CycleWay {
//   osm_id: number;
//   name: string;
//   length: number;
//   highway: string;
//   has_cycleway: boolean;
//   cycleway_typology: string;
//   relation_id: number;
//   geojson: any; // Use a more specific type if available
//   lastUpdated: Date;
//   city_id: number | null;
//   dual_carriageway: boolean;
//   pdc_typology: string;
// }

// interface OSMElement {
//   type: string;
//   tags: any;
//   geometry: any;
//   id: number;
//   members: Member[];
// }

// interface Member {
//   type: string;
//   ref: number;
// }

// interface OSMData {
//   elements: OSMElement[];
// }

// router.get("/", async (req: Request, res: Response) => {
//   try {
//     const comparedData = await compareExistingRMRCycleInfraWithPDCRMR();
//     // await deleteAllDataFromWaysTable();
//     console.log("DADOS apagados com sucesso");
//     // await insertWaysData(comparedData);
//     console.log("GET /cyclist-infra/update: UPDATE successfully");
//     res.json(comparedData);
//   } catch (error) {
//     console.error("GET /cyclist-infra/ways: Error fetching data:", error);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });

// // function that compares PDC with the existent cycle in RMR
// async function compareExistingRMRCycleInfraWithPDCRMR(): Promise<any[]> {
//   // Get the osm_id array
//   const allRelations: RelationData[] = await db
//     .select()
//     .from(schema.cyclist_infra_relations)
//     .execute();
//   const osmIdsOfRelations: (number | null)[] = allRelations.map(
//     (relation) => relation.osmId
//   );
//   const notNullOsmIdsOfRelations: number[] = osmIdsOfRelations.filter(
//     (osmId): osmId is number => osmId !== null
//   );

//   // Call the OSMController.getWaysOSMJsonFromRelationsIds() method to fetch the OSM data of all relations
//   const pdcWaysData: OSMData = await OSMController.getRelationJsonFromIds(
//     notNullOsmIdsOfRelations
//   );

//   // Map pdcData to include the relevant data for each element in pdcWaysData
//   const pdcDataMappedPromises: Promise<any>[] = pdcWaysData.elements.map(
//     async (element) => {
//       const matchingPdcData: RelationData | undefined = allRelations.find(
//         (data) => data.osmId === element.id
//       );
//       const waysIds: number[] = element.members
//         .filter((member) => member.type === "way")
//         .map((member) => member.ref);

//       const ways: OSMData = await OSMController.getOSMJsonWaysFromWaysIds(
//         waysIds
//       );

//       return {
//         ...element,
//         members: ways.elements,
//         pdc: matchingPdcData,
//       };
//     }
//   );

//   const pdcDataMapped: Element[] = await Promise.all(pdcDataMappedPromises); // Replace any[] with the actual return type

//   const rmrCycleWaysData: OSMData =
//     await OSMController.getCycleWaysOSMJsonFromArea({
//       area: "Região Metropolitana do Recife",
//     });

//   const fakeRelationOfRemainData = [
//     {
//       type: "relation",
//       id: null,
//       members: rmrCycleWaysData.elements,
//       tags: { name: "" },
//       pdc: allRelations.find((p) => p.id === 0),
//     },
//   ];

//   return compareExistingInfrastrutureOnAreaWithProjectOnRelations(
//     fakeRelationOfRemainData,
//     pdcDataMapped
//   );
// }
// async function compareExistingInfrastrutureOnAreaWithProjectOnRelations(
//   existing: Element[],
//   projected: Element[]
// ): Promise<CycleWay[]> {
//   try {
//     const lastupdated = new Date();
//     const allCycleWays: CycleWay[] = [];
//     const projectedAndExisting = [...projected]; // Clone to avoid mutating the original array
//     const firstExisting = existing[0];
//     const existingNotProjected = firstExisting.members.filter(
//       (m) => !projected.some((p) => p.members.some((pm) => pm.id === m.id))
//     );

//     projectedAndExisting.push({
//       ...firstExisting,
//       members: existingNotProjected,
//     });

//     const cities = await db.select().from(schema.cities).execute();

//     const cityPromises = projectedAndExisting.map((element) => {
//       return Promise.all(
//         element.members.map(async (member) => {
//           const geojson = osmtogeojson({ elements: [member] });
//           const city_id = await getCityByPoint(
//             cities,
//             rmrCities,
//             member.geometry[0].lat,
//             member.geometry[0].lon
//           );

//           const dual_carriageway = member.tags.dual_carriageway === "yes";
//           const total_km = turf.length(geojson);
//           const typology = getTypologyFromProperties(member.tags); // Ensure this function is typed
//           const onPDC = element.pdc !== undefined;

//           if (member.type === "way") {
//             const newElementFormat: CycleWay = {
//               osm_id: member.id,
//               name: member.tags.name || "",
//               length: dual_carriageway ? total_km / 2 : total_km,
//               highway: member.tags.highway || "",
//               has_cycleway: typology !== "none",
//               cycleway_typology: typology || "",
//               relation_id: onPDC ? element.pdc!.id : 0,
//               geojson: geojson,
//               lastUpdated: lastupdated,
//               city_id: city_id,
//               dual_carriageway: dual_carriageway,
//               pdc_typology: onPDC
//                 ? element.pdc!.pdcTypology || "notOnPDC"
//                 : "notOnPDC",
//             };
//             allCycleWays.push(newElementFormat);
//           }
//         })
//       );
//     });

//     await Promise.all(cityPromises);
//     return allCycleWays;
//   } catch (error) {
//     console.error("Error fetching data from Overpass API:", error);
//     throw error;
//   }
// }

// async function getCityByPoint(
//   cities: City[],
//   citiesJson: CityJson,
//   lat: number,
//   lon: number
// ): Promise<number | null> {

//   const point = turf.point([lon, lat]);

//   let cityName: string | null = null;

//   for (const polygon of citiesJson.features) {
//     if (turf.booleanPointInPolygon(point, polygon)) {
//       cityName = polygon.properties.name;
//       break;
//     }
//   }
//   const city = cities.find((c) => c.name === cityName);
//   return city ? city.id : null;
// }

// function getTypologyFromProperties(properties: {
//   [key: string]: string;
// }): string {
//   const typologyMap = getTypologyMap(); 
//   const filters = Object.entries(properties)
//     .map(([key, value]) => {
//       const filterString = `${key}=${value}`;
//       if (typologyMap[filterString]) {
//         const { composed } = typologyMap[filterString];
//         if (composed) {
//           const matchesComposed = Object.entries(properties).some(
//             ([propKey, propValue]) => composed === `${propKey}=${propValue}`
//           );
//           if (matchesComposed) {
//             return typologyMap[filterString].name;
//           }
//         } else {
//           return typologyMap[filterString].name;
//         }
//       }
//     })
//     .filter(Boolean);
//   return filters.length > 0 ? filters[0] : "none";
// }

// function getTypologyMap(layers: Layer[]): TypologyMap {
//   const typologyMap: TypologyMap = {};

//   layers.forEach((layer) => {
//     if (layer.filters) {
//       layer.filters.forEach((filter) => {
//         let filterString;
//         if (Array.isArray(filter[0])) {
//           filterString = filter[0].join("=");
//         } else {
//           filterString = filter.join("=");
//         }
//         typologyMap[filterString] = {
//           name: layer.name,
//           composed: Array.isArray(filter[0]) ? filter[0].join("=") : false,
//         };
//       });
//     }
//   });
//   return typologyMap;
// }
