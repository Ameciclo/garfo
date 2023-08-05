// Import necessary modules and packages
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cyclistCountsRouter = require("./cyclist-counts");
const cyclistCountsEditionsRouter = require("./cyclist-counts-editions");
const cyclistProfileRouter = require("./cyclist-profile");
const cyclistProfileEditionsRouter = require("./cyclist-profile-editions");
const { getRelationsData } = require("./cycling-infra-relations.js");
const OSMController = require("./OSMController"); // Add this line to require the OSMController module
const comparePDConRMR = require("./cycling-infra-comparision.js");
const updateInfraData = require("./cycling-infra-updater");
const { getWaysData } = require("./cycling-infra-ways");

const port = 3000; // Define the desired port for the API

// Create an instance of Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

app.use("/cyclist-counts", cyclistCountsRouter);

app.use("/cyclist-counts/editions", cyclistCountsEditionsRouter);

app.use("/cyclist-profile", cyclistProfileRouter);

app.use("/cyclist-profile/editions", cyclistProfileEditionsRouter);

// Route to use the data from getRelationsData function
app.get("/cycling-infra/relations", async (req, res) => {
  try {
    const relationsData = await getRelationsData();
    console.log("GET /cycling-infra/relations: Data fetched successfully");
    res.json(relationsData);
  } catch (error) {
    console.error("GET /cycling-infra/relations: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Route to use the data from getWaysData function
app.get("/cycling-infra/ways", async (req, res) => {
  try {
    const waysData = await getWaysData();
    console.log("GET /cycling-infra/ways: Data fetched successfully");
    res.json(waysData);
  } catch (error) {
    console.error("GET /cycling-infra/ways: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Add route to fetch data for a specific OSM relation by ID
app.get("/cycling-infra/relation/:relationId", async (req, res) => {
  try {
    const { relationId } = req.params;
    const relationData = await OSMController.getWaysFromRelationData(relationId);
    console.log(`GET /cycling-infra/relation/${relationId}: Data fetched successfully`);
    res.json(relationData);
  } catch (error) {
    console.error(`GET /cycling-infra/relation/${relationId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add the route to fetch PDC data
app.get("/cycling-infra/update", async (req, res) => {
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

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
