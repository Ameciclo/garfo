const cities_basics = require("./cities-basics-all.json");
const cities_network = require("./cities-network.json");

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
};
