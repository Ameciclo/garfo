const { interpolation, get_average } = require("../../../commons/utils");

function calculate_average(arr) {
  return get_average(arr);
}

function calculate_no_evaluated(arr) {
  return -1;
}

function calculate_binnary_rate([count, dont_jump = true]) {
  if (!dont_jump) {
    if (count > 0) return 10;
    return 0;
  }
  return -1;
}

function calculate_evaluation_pattern([pattern, description]) {
  return pattern[description] || -1;
}

////////
function calculate_buffer_size([buffer_width, typology, [x1, x2]]) {
  if (typology.toLowerCase() != "ciclorrota")
    return interpolation(buffer_width, x1, x2);
  return -1;
}

////////
function calculate_interpolated_values([
  length,
  count,
  [x1, x2],
  dont_jump = true,
]) {
  if (!dont_jump) return -1;
  if (count > 0) return interpolation(length / count, [x1, x2]);
  return 0;
}

function calculate_count_proportion([count, total]) {
  if (total != 0) return (count / total) * 10;
  return 0;
}

function calculate_obstacles([length, count]) {
  // Nota 10 para 0 obstáculos por km
  // Nota 7,5 para 1 obstáculo a cada 2km
  // Nota 5 para 2 obstáculos a cada 2km
  // Nota 2,5 para 3 obstáculos porcada 2km
  // Nota 0 para mais de 1 obstáculo por km
  if (count <= length) return 10 * (1 - 0.5 * (count / length));
  return 0;
}

////////
function calculate_lighting([
  length,
  road_width,
  dedicated_ligthing,
  same_side_ligthing,
  other_side_ligthing,
]) {
  //  Example: calculate Distance between each streetlight pole having following Details,
  //    Road Details: The width of road (w) is 11.5 Foot.
  //    Pole Details: The height of Pole is 26.5 Foot.
  let h = 12;
  //    Luminaire of each Pole: Wattage of Luminaries is 250 Watt, Lamp Out Put (LL) is 33200 Lumen, Required Lux Level  (Eh) is 5 Lux, Coefficient of Utilization Factor (Cu) is 0.18, Lamp Lumen Depreciation Factor (LLD) is 0.8, Lamp Lumen Depreciation Factor (LDD) is 0.9.
  let ll = 33200;
  let cu = 0.18;
  let lld = 0.8;
  let ldd = 0.9;
  let eh_min = 20;
  let eh_max = 5;
  //    Space Height Ratio should be less than 3.
  //Calculation:
  //    Spacing between each Pole=(LL*CU*LLD*LDD) / Eh*W
  let d_min = (ll * cu * lld * ldd) / ((eh_min * road_width) / 0.3048);
  let d_max = (ll * cu * lld * ldd) / ((eh_max * road_width) / 0.3048);
  let total = 0;
  if (road_width > 1.6 * h) {
    total =
      dedicated_ligthing +
      (0.9 * (same_side_ligthing + other_side_ligthing)) / 2;
  } else if (road_width > h) {
    total =
      dedicated_ligthing +
      (0.9 * (same_side_ligthing + 0.7 * other_side_ligthing)) / 2;
  } else {
    total =
      dedicated_ligthing +
      0.9 * (same_side_ligthing + 0.7 * other_side_ligthing);
  }
  let rate = interpolacao(total / length, d_max, d_min);
  return rate;
}

////////
function calculate_access([
  way_with_access,
  ways_without_access,
  all_access_count,
  access_evaluation,
]) {
  let rate = -1;
  switch (access_evaluation) {
    case "Segregadores NÃO DIFICULTAM o acesso":
      rate = 10;
      break;
    case "Segregadores DIFICULTAM o acesso parcialmente":
      rate = interpolation(
        all_access_count / (ways_without_access + way_with_access),
        0,
        1
      );
      break;
    case "Segregadores IMPEDEM o acesso":
      rate = interpolation(
        all_access_count / (ways_without_access + way_with_access),
        0,
        1
      );
      break;
    case "N/A":
      rate = -1;
      break;
    default:
      rate = -1;
  }
  return rate;
}

function calculate_width_evaluation(form) {
  const { cyclable_width, flow_direction, typology } = form.characteristics;
  if (typology === "ciclorrota") return -1;
  switch (flow_direction) {
    case "unidirecional, no fluxo dos automóveis":
    case "unidirecional, no contrafluxo dos automóveis":
      if (cyclable_width <= 1.5) {
        return interpolation(cyclable_width, 1.2, 1.5, 0, 8);
      } else {
        return interpolation(cyclable_width, 1.5, 2.5, 8, 10);
      }
    case "bidirecional":
    case "bidirecional, com MÃO INGLESA na estrutura":
      if (cyclable_width <= 2.5) {
        return interpolation(cyclable_width, 2.2, 2.5, 0, 8);
      } else {
        return interpolation(cyclable_width, 2.5, 3.5, 8, 10);
      }
    default:
      return -1;
  }
}
module.exports = {
  calculate_average,
  calculate_no_evaluated,
  calculate_binnary_rate,
  calculate_evaluation_pattern,
  calculate_buffer_size,
  calculate_interpolated_values,
  calculate_count_proportion,
  calculate_width_evaluation,
  calculate_lane_width,
  calculate_obstacles,
  calculate_access,
  calculate_lighting,
};
