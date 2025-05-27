// Import necessary modules and packages
import express from "express";
import cors from "cors";
import fs from "fs/promises";

import citiesRouter from "./modules/global/cities";

import cyclistCountsRouter from "./modules/cyclist-counts/summary";
import cyclistCountsEditionsRouter from "./modules/cyclist-counts/edition";

import cyclistInfraRelationsByCityRouter from "./modules/cyclist-infra/relations-by-city";
import cyclistInfraRelationsRouter from "./modules/cyclist-infra/relations";
import cyclistInfraRelationRouter from "./modules/cyclist-infra/relation";
import cyclistInfraWaysRouter from "./modules/cyclist-infra/ways";

import trafficCrashesSummaryRouter from "./modules/traffic-crashes/summary.js";
import trafficCrashesGeojsonRouter from "./modules/traffic-crashes/geojson";
import trafficCrashesVehiclesRouter from "./modules/traffic-crashes/vehicles";
import trafficCrashesStreetsSummaryRouter from "./modules/traffic-crashes/streets-summary";
import datasusDeathsRouter from "./modules/datasus-deaths";
//import cyclistInfraUpdateRouter from "./modules/update/updater";

const port = 8080; // Define the desired port for the API

// Create an instance of Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// ROUTES
app.use("/cities", citiesRouter);
app.use("/cyclist-counts", cyclistCountsRouter);
app.use("/cyclist-counts/edition", cyclistCountsEditionsRouter);
app.use("/cyclist-infra/relations", cyclistInfraRelationsRouter);
app.use("/cyclist-infra/relationsByCity", cyclistInfraRelationsByCityRouter);
app.use("/cyclist-infra/relation", cyclistInfraRelationRouter);
app.use("/cyclist-infra/ways", cyclistInfraWaysRouter);
app.use("/traffic-crashes/summary", trafficCrashesSummaryRouter);
app.use("/traffic-crashes/geojson", trafficCrashesGeojsonRouter);
app.use("/traffic-crashes/vehicles", trafficCrashesVehiclesRouter);
app.use("/traffic-crashes/streets-summary", trafficCrashesStreetsSummaryRouter);
app.use("/datasus-deaths", datasusDeathsRouter);
//app.use("/cyclist-infra/update", cyclistInfraUpdateRouter);

// Rota para servir a página de listagem de rotas
app.get("/api-routes", async (req, res) => {
  try {
    const routesListHtml = await fs.readFile("api-routes.html", "utf8");
    res.send(routesListHtml);
  } catch (error) {
    console.error("Error reading HTML file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
