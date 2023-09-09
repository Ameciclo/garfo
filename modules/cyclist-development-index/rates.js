const express = require("express");
const {
  calculateSegmentedRates,
  calculateGroupedRates,
} = require("./rates/rates-calculations");
const {
  getTitlesAndDescriptions,
  buildTitleTree,
} = require("./rates/rates-headers");
const get_forms_data = require("./form/forms-data");
const app = express();
const PORT = 3000;


app.get("/city", (req, res) => {
  res.send(getTitlesAndDescriptions(get_forms_data()[0]));
});

app.get("/rates/descriptions", (req, res) => {
  res.send(getTitlesAndDescriptions(get_forms_data()[0]));
});

app.get("/rates/tree", (req, res) => {
  res.send(buildTitleTree(get_forms_data()[0]));
});

app.get("/rates/segments", (req, res) => {
  res.send(calculateSegmentedRates(get_forms_data()));
});

app.get("/rates", (req, res) => {
  res.send(calculateGroupedRates(get_forms_data()));
});

app.get("/forms", (req, res) => {
  res.send(get_forms_data());
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
