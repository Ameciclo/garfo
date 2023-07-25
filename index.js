// INDEX.JS
// Import necessary modules and packages
require("dotenv").config();
const { RELATION_IDS } = require("./constants.js");
const express = require("express");
const cors = require("cors");

// Create an instance of Express app
const app = express();

const port = 3000; // Define the desired port for the API

// Enable CORS to allow cross-origin requests
app.use(cors());

// Import and use routes for cyclist counts and editions
const cyclistCountsRouter = require("./cyclist-counts");
app.use("/cyclist-counts", cyclistCountsRouter);

const cyclistCountsEditionsRouter = require("./cyclist-counts-editions");
app.use("/cyclist-counts-editions", cyclistCountsEditionsRouter);

const cyclistProfileRouter = require("./cyclist-profile");
app.use("/cyclist-profile", cyclistProfileRouter);

const cyclistProfileEditionsRouter = require("./cyclist-profile-editions");
app.use("/cyclist-profile-editions", cyclistProfileEditionsRouter);

// Import the router for fetching PDC data
const {getRelationsData} = require("./cycling-infra-relations.js");
// Route to use the data from getRelationsData function
app.get("/cycling-infra-relations", async (req, res) => {
  try {
    const relationsData = await getRelationsData();
    res.json(relationsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Add the route to fetch OSM data
const OSMController = require("./OSMController"); // Add this line to require the OSMController module
app.get("/osm-data", async (req, res) => {
  try {
    const constraints = {
      area: "Recife", // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };

    // Call the OSMController.getData() method to fetch the OSM data
    const { geoJson } = await OSMController.getAreaData(constraints);

    // Send the retrieved data as a response
    res.json(geoJson);
  } catch (error) {
    console.error("Error fetching OSM data:", error);
    res.status(500).json({ error: "Error fetching OSM data" });
  }
});

// Add the route to fetch PDC data
app.get("/pdc-data", async (req, res) => {
  try {
    const constraints = {
      area: "Recife", // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };

    // Call the fetchInfrastructureData() function to get the osm_id array
    const pdcData = await getRelationsData();
    const osmIds = pdcData.map((relation) => relation.osm_id);    
    const filteredOsmIds = osmIds.filter((osmId) => osmId !== null);

    // Call the OSMController.getOSMAllRelationsData() method to fetch the OSM data
    const relationsData = await OSMController.getOSMAllRelationsData(
      [filteredOsmIds[0]]
    );

    // Call the OSMController.getOSMAreaData() method to fetch the OSM data
    const areaData = await OSMController.getOSMAreaData(constraints);

    // Call the compareRefs() function to compare the data
    const comparisonResult = await OSMController.compareRefs(
      areaData,
      relationsData,
      pdcData
    );

    // Send the retrieved data as a response
    res.json(comparisonResult);
  } catch (error) {
    console.error("Error fetching OSM data:", error);
    res.status(500).json({ error: "Error fetching OSM data" });
  }
});

// Add route to fetch data for a specific OSM relation by ID
app.get("/relation/:relationId", async (req, res) => {
  try {
    const { relationId } = req.params;
    const relationData = await OSMController.getRelationData(relationId);
    res.json(relationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add route to fetch data for all OSM relations
app.get("/relations", async (req, res) => {
  try {
    const relationData = await OSMController.getAllRelationsData();
    res.json(relationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
