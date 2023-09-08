const express = require("express");
const {
  getTitlesAndDescriptions,
  buildTitleTree,
  getRates,
} = require("./rates/rates-calculations");
const get_forms_data = require("./form/forms-data");
const app = express();
const PORT = 3000;

app.get("/rates_descriptions", (req, res) => {
  res.send(getTitlesAndDescriptions(get_forms_data()[0]));
});

app.get("/rates_tree", (req, res) => {
  res.send(buildTitleTree(get_forms_data()[0]));
});

app.get("/rates", (req, res) => {
  res.send(getRates(get_forms_data()));
});

app.get("/forms", (req, res) => {
  res.send(get_forms_data());
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
