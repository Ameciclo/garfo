const cities_basics = require("./cities-basics-all.json");
const cities_network = require("./cities-network.json");

const fs = require("fs");

// Função para converter um objeto JSON em uma linha CSV
function jsonToCsvRow(jsonObj) {
  const values = Object.values(jsonObj);
  return values.join(",");
}

function json2csv(data) {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Os dados não são um array de objetos JSON válidos.");
    return;
  }

  // Caminho para o arquivo onde você deseja salvar os dados
  const filePath = "dados.csv";

  // Crie o cabeçalho a partir das chaves do primeiro objeto no array
  const header = Object.keys(data[0]);

  // Converter cada objeto JSON em uma linha CSV e juntar todas as linhas em uma única string CSV
  const csvString = [header.map(JSON.stringify).join(",")].concat(
    data.map(jsonToCsvRow)
  ).join("\n");

  // Use writeFile para salvar a string no arquivo
  fs.writeFile(filePath, csvString, (err) => {
    if (err) {
      console.error("Erro ao salvar o arquivo:", err);
      return;
    }
    console.log("Arquivo salvo com sucesso em", filePath);
  });
}

function get_weights() {
  return {
    road: 0.5901639344,
    street: 0.262295082,
    local: 0.1475409836,
  };
}

function get_road_types() {
  return {
    road: { highway_types: ["motorway", "trunk", "primary"], speed: 60 },
    street: { highway_types: ["secondary", "tertiary"], speed: 40 },
    local: { highway_types: ["residential"], speed: 30 },
  };
}

function get_road_network(city_id, year) {
  const n = cities_network.filter(
    (n) => n.city === get_city_name(city_id) && n.year === year
  )[0];
  return {
    id: city_id,
    year: year,
    network: {
      road:
        (n.motorway +
          n.motorway_link +
          n.trunk +
          n.trunk_link +
          n.primary +
          n.primary_link) /
        1000,
      street:
        (n.secondary + n.secondary_link + n.tertiary + n.tertiary_link) / 1000,
      local: (n.residential + n.unclassified) / 1000,
      unclassified:
        n.unclassified /
        (n.motorway +
          n.motorway_link +
          n.trunk +
          n.trunk_link +
          n.secondary +
          n.secondary_link +
          n.tertiary +
          n.tertiary_link +
          n.residential +
          n.unclassified),
    },
  };
}

function filterById(jsonObject, id) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject["id"] == id;
  })[0];
}

function filterByKey(jsonObject, key, value) {
  return jsonObject.filter(function (jsonObject) {
    return jsonObject[key] == value;
  })[0];
}

function get_city_name(id) {
  return filterById(cities_basics, id).name;
}

function group_by(objetoArray, propriedade) {
  return objetoArray.reduce(function (acc, obj) {
    let key = obj[propriedade];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

module.exports = {
  get_road_types,
  get_weights,
  get_city_name,
  get_city_name,
  group_by,
  get_road_network,
  json2csv,
};