import express from 'express';
import cors from 'cors';
import citiesRouter from './modules/cities/cities';

const port = 8080; // Define the desired port for the API

// Create an instance of Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// ROUTES
app.use("/cities", citiesRouter);

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
