// INDEX.JS
require('dotenv').config();
const express = require('express');
const cors = require('cors')
const OSMController = require('./osm-data'); // Add this line to require the OSMController module

const app = express();

const port = 3000; // Define the desired port for the API

app.use(cors())

const cyclistCountsRouter = require('./cyclist-counts');
app.use('/cyclist-counts', cyclistCountsRouter);

const cyclistCountsEditionsRouter = require('./cyclist-counts-editions');
app.use('/cyclist-counts-editions', cyclistCountsEditionsRouter);

const cyclistProfieRouter = require('./cyclist-profile');
app.use('/cyclist-profile', cyclistProfieRouter);

const cyclistProfileEditionsRouter = require('./cyclist-profile-editions');
app.use('/cyclist-profile-editions', cyclistProfileEditionsRouter);

// Add the route to fetch OSM data
app.get('/osm-data', async (req, res) => {
  try {
    const constraints = {
      area: 'Recife', // Replace with the name of the city in the Recife metropolitan region
      // Add any other constraints you might need here
    };

    // Call the OSMController.getData() method to fetch the OSM data
    const { geoJson } = await OSMController.getData(constraints);

    // Send the retrieved data as a response
    res.json(geoJson);
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    res.status(500).json({ error: 'Error fetching OSM data' });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
