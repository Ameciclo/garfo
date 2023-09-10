const express = require("express");
const {
  calculateSegmentedRates,
  calculateGroupedRates,
} = require("./rates/rates-calculations");
const get_cities_reviews = require("./infra/city-reviews");
const {
  getTitlesAndDescriptions,
  buildTitleTree,
} = require("./rates/rates-headers");
const { get_structures } = require("./infra/city-structure");
const get_forms_data = require("./form/forms-data");
const { json2csv } = require("./infra/utils");
const app = express();
const PORT = 3000;

app.get("/review/", (req, res) => {
  res.send(get_cities_reviews());
});

app.get("/review/structures", (req, res) => {
  res.send(get_structures());
});

app.get("/review/flatstructures", (req, res) => {
  const data = get_structures();
  // Inicialize um array vazio para armazenar os resultados
  const resultado = [];

  // Iterar sobre o array de objetos JSON
  data.forEach((item) => {
    // Criar um novo objeto com as chaves e valores diretamente associados
    const rates = { ...item.rates };
    const noRates = item
    noRates.rates = [];
    const novoObjeto = {
      ...rates,
      ...noRates,
      form_ids: item.form_ids.join("/ "),
    };
    resultado.push(novoObjeto);
  });
  json2csv(resultado);

  res.send(resultado);
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
