// INDEX.JS
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const port = 3000; // Define the desired port for the API

app.use(cors());

const cyclistCountsRouter = require("./cyclist-counts");
app.use("/cyclist-counts", cyclistCountsRouter);

const cyclistCountsEditionsRouter = require("./cyclist-counts-editions");
app.use("/cyclist-counts-editions", cyclistCountsEditionsRouter);

const cyclistProfieRouter = require("./cyclist-profile");
app.use("/cyclist-profile", cyclistProfieRouter);

const cyclistProfileEditionsRouter = require("./cyclist-profile-editions");
app.use("/cyclist-profile-editions", cyclistProfileEditionsRouter);
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

app.get("/pdc-data", async (req, res) => {
  try {
    const constraints = {
      area: "Recife", // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };

    // Call the OSMController.getOSMAllRelationsData() method to fetch the OSM data
    const relationsData = await OSMController.getOSMAllRelationsData();

    // Call the OSMController.getOSMAreaData() method to fetch the OSM data
    const areaData = await OSMController.getOSMAreaData(constraints);

    //console.log(JSON.stringify(relationsData))

    // Call the compareRefs() function to compare the data
    const comparisonResult = OSMController.compareRefs(areaData, relationsData);

    // Send the retrieved data as a response
    res.json({area: areaData, pdc: relationsData, result: comparisonResult});
  } catch (error) {
    console.error("Error fetching OSM data:", error);
    res.status(500).json({ error: "Error fetching OSM data" });
  }
});

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

app.get("/relations", async (req, res) => {
  try {
    const relationData = await OSMController.getAllRelationsData();
    res.json(relationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
