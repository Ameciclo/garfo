// Import necessary modules and packages
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const citiesRouter = require("./modules/cities/cities");

const cyclistCountsRouter = require("./modules/cyclist-counts/summary");
const cyclistCountsEditionsRouter = require("./modules/cyclist-counts/editions");

const cyclistProfileRouter = require("./modules/cyclist-profile/summary");
const cyclistProfileEditionsRouter = require("./modules/cyclist-profile/editions");

const cyclistInfraRelationsByCityRouter = require("./modules/cyclist-infra/relations-by-city.js");
const cyclistInfraRelationsRouter = require("./modules/cyclist-infra/relations");
const cyclistInfraRelationRouter = require("./modules/cyclist-infra/relation");
const cyclistInfraWaysRouter = require("./modules/cyclist-infra/ways");
const cyclistInfraUpdateRouter = require("./modules/cyclist-infra/updater");

const port = 8080; // Define the desired port for the API

// Create an instance of Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// ROUTES
app.use("/cities", citiesRouter);
app.use("/cyclist-counts", cyclistCountsRouter);
app.use("/cyclist-counts/edition", cyclistCountsEditionsRouter);
app.use("/cyclist-profile", cyclistProfileRouter);
app.use("/cyclist-profile/edition", cyclistProfileEditionsRouter);
app.use("/cyclist-infra/relations", cyclistInfraRelationsRouter);
app.use("/cyclist-infra/relationsByCity", cyclistInfraRelationsByCityRouter);
app.use("/cyclist-infra/relation", cyclistInfraRelationRouter);
app.use("/cyclist-infra/ways", cyclistInfraWaysRouter);
app.use("/cyclist-infra/update", cyclistInfraUpdateRouter);

// Rota para servir a página de listagem de rotas
app.get("/api-routes", (req, res) => {
  const routesListHtml = fs.readFileSync("api-routes.html", "utf8");
  res.send(routesListHtml);
});

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
