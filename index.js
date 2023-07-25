// INDEX.JS
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
const compareRefs = require("./cycling-infra-comparision.js");

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
    res.json(relationsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// Add route to fetch data for a specific OSM relation by ID
app.get("/cycling-infra/relation/:relationId", async (req, res) => {
  try {
    const { relationId } = req.params;
    const relationData = await OSMController.getRelationData(relationId);
    res.json(relationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add the route to fetch PDC data
app.get("/cycling-infra/observatory", async (req, res) => {
  try {
    // Call the fetchInfrastructureData() function to get the osm_id array
    const pdcData = await getRelationsData();
    const osmIds = pdcData.map((relation) => relation.osm_id);
    const filteredOsmIds = osmIds.filter((osmId) => osmId !== null);

    // Call the OSMController.getOSMAllRelationsData() method to fetch the OSM data
    const relationsData = await OSMController.getOSMAllRelationsData([
      filteredOsmIds[0],
    ]);

    const constraints = {
      area: "Recife", // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };
    // Call the OSMController.getOSMAreaData() method to fetch the OSM data
    const areaData = await OSMController.getOSMAreaData(constraints);

    // Call the compareRefs() function to compare the data
    const comparisonResult = await compareRefs(
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

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

// // Add the route to fetch OSM data
// app.get("/cycling-infra-recife", async (req, res) => {
//   try {
//     const constraints = {
//       area: "Recife", // Replace with the name of the city in the Recife metropolitan region
//       // Add any other constraints you might need here
//     };

//     // Call the OSMController.getData() method to fetch the OSM data
//     const { geoJson } = await OSMController.getAreaData(constraints);

//     // Send the retrieved data as a response
//     res.json(geoJson);
//   } catch (error) {
//     console.error("Error fetching OSM data:", error);
//     res.status(500).json({ error: "Error fetching OSM data" });
//   }
// });

// // Add route to fetch data for all OSM relations
// app.get("/relations", async (req, res) => {
//   try {
//     // Call the fetchInfrastructureData() function to get the osm_id array
//     const pdcData = await getRelationsData();
//     const osmIds = pdcData.map((relation) => relation.osm_id);
//     const filteredOsmIds = osmIds.filter((osmId) => osmId !== null);
//     const relationData = await OSMController.getAllRelationsData(filteredOsmIds);
//     res.json(relationData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
