const all_forms = require("./ssa_forms.json");
const get_forms_conversion = require("./forms-conversion");
const { key_value_inversion } = require("../../../commons/utils");

const forms_conversion = get_forms_conversion("salvador", 2023);

function get_conversion(combinedConversion, item_key) {
  const return_value = {};
  for (const key in combinedConversion) {
    const item = combinedConversion[key];
    return_value[key] = item[item_key];
  }
  return return_value;
}

function get_converted_form(form, edition = "salvador2023") {
  const conversion = get_conversion(forms_conversion, edition);
  const conversion_type = get_conversion(forms_conversion, "type");

  const revertedConvertion = key_value_inversion(conversion);

  let converted = {};
  for (let key in form) {
    let converted_key = revertedConvertion[key];
    if (converted_key) converted[converted_key] = form[key];
    else console.log(`não encontrada a key: ${key} ${form[key]}`);
  }

  for (const key in converted) {
    const conversionKey = conversion_type[key];
    const value = converted[key];
    switch (conversionKey) {
      case "int":
        const new_value_int = parseInt(value == "" ? "0" : value);
        converted[key] = new_value_int;
        break;
      case "float":
        const new_value_float = parseFloat(value.replace(",", "."));
        converted[key] = new_value_float || 0;
        break;
      default:
        converted[key] = value;
    }
  }
  converted["full_flow_direction"] = converted["flow_direction"];
  converted["flow_direction"] = converted["flow_direction"].split(",")[0];
  converted["all_risks_situations_count"] = parseInt(
    converted["all_risks_situations_count"]
  );
  converted["on_way_risks_situations_count"] =
    converted["bus_stops_along"] +
    converted["structure_side_change_without_speed_reducers_or_lights"] +
    converted["structure_abrupt_end_in_counterflow"];
  converted["crossing_risks_situations_count"] =
    converted["crossings_no_speed_reduction"] +
    converted["conversion_path_allows_car_intrusion"] +
    converted["car_turning_left_with_cyclist_invisibility"];
  converted["total_unlevel_controls"] =
    converted["pedestrian_crossings_count"] + converted["speed_bumps_count"];

  const bike_infra_width =
    converted["typology"].toLowerCase() != "ciclorrota"
      ? converted["ridable_width"] + converted["buffer_width"]
      : 0;
  let parking_width = 0;
  switch (converted["parking"]) {
    case "Estacionamento proibido na via":
      parking_width = 0;
      break;
    case "Estacionamento de um lado apenas":
      parking_width = 1.8;
      break;
    case "Estacionamento dos dois lados":
      parking_width = 3.6;
      break;
    case "Estacionamento dedicado de um lado, incluso na circulação":
      parking_width = 1.8;
      break;
    case "Estacionamento dedicado de um lado, segregado da circulação":
      parking_width = 2;
      break;
    case "Estacionamento dedicado dos dois lados":
      parking_width = 4;
      break;
    default:
      parking_width = 0;
  }
  const lane_width =
    converted["contiguos_lanes"] > 0
      ? (converted["road_width"] - bike_infra_width - parking_width) /
          converted["contiguos_lanes"] -
        1
      : null;
  (converted["mean_lane_width"] = lane_width > 2),
    5 && lane_width < 5 ? lane_width : null;
  const crosses =
    converted["good_conditions_crossing_signs"] +
    converted["bad_conditions_crossing_signs"] +
    converted["no_visible_crossing_signs"];
  converted["mean_square_size"] =
    crosses > 2 ? converted["seg_length"] / (crosses - 1) : null;
  return converted;
}

function get_forms_data() {
  let forms_data = [];
  all_forms.forEach((form) => {
    forms_data.push(get_converted_form(form));
  });
  return forms_data;
}

module.exports = get_forms_data;
