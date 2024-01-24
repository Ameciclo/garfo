import express, { Request, Response } from "express";
import { db } from "../../db";
import * as schema from "../../db/migration/schema";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const waysData = await getWaysData();
    console.log("GET /cyclist-infra/ways: Data fetched successfully");
    res.json(waysData);
  } catch (error) {
    console.error("GET /cyclist-infra/ways: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

function generateCitySummary(cityData: any[]) {
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

router.get("/summary", async (req: Request, res: Response) => {
  try {
    const waysData = await getWaysData();

    const cities: { [key: string]: any[] } = {}; // Objeto para armazenar dados por cidade

    waysData.forEach((d) => {
      if (!cities[d.cityId!]) {
        cities[d.cityId!] = [];
      }
      cities[d.cityId!].push(d);
    });

    const summaryByCity: { [key: string]: any } = {};

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

router.get("/all-ways", async (req: Request, res: Response) => {
  try {
    const waysData = await getWaysData();
    const combinedData = combineFeatures(waysData);
    console.log("GET /cyclist-infra/all-ways: Data processed successfully");

    const cities: { [key: string]: any[] } = {}; // Objeto para armazenar dados por cidade

    waysData.forEach((d) => {
      if (!cities[d.cityId!]) {
        cities[d.cityId!] = [];
      }
      cities[d.cityId!].push(d);
    });

    const combinedDataByCity: { [key: string]: any } = {};

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
function combineFeatures(dataArray: any[]) {
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

async function getWaysData() {
  try {
    const ways = await db.select().from(schema.cyclist_infra_ways).execute();
    return ways;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

export default router;
