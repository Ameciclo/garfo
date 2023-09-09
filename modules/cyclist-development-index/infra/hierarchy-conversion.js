const hierarchy_length = require("./city-hierarchy-length.json");

function get_road_types() {
  return {
    road: { types: ["motorway", "trunk", "primary"], speed: 60 },
    street: { types: ["secondary", "tertiary"], speed: 40 },
    local: { types: ["local"], speed: 30 },
  };
}

function get_weights() {
    return {
      road: 0.5901639344,
      street: 0.262295082,
      local: 0.1475409836,
    }
  }

  module.exports = get_road_types