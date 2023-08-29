const { interpolation, get_average } = require("../../../commons/utils");

function average_rate(arr) {
  return get_average(arr);
}

function no_evaluated_rate(arr) {
  return -1;
}

function binnary_rate([count, dont_jump = true]) {
  if (!dont_jump) {
    if (count > 0) return 10;
    return 0;
  }
  return -1;
}

function inverted_binnary_rate([count, dont_jump = true]) {
  if (!dont_jump) {
    if (count > 0) return 10;
    return 0;
  }
  return -1;
}
function evaluation_pattern_rate([pattern, description]) {
  return pattern[description] || -1;
}

////////
function interpolated_rate([
  length,
  count,
  [x1, x2, y1 = 0, y2 = 10],
  dont_jump = true,
]) {
  if (!dont_jump) return -1;
  if (count > 0)
    return (
      Math.round(interpolation(length / count, [x1, x2, y1, y2]) * 10) / 10
    );
  return 0;
}

function proportion_rate([count, total]) {
  if (total != 0) return (count / total) * 10;
  return 0;
}

module.exports = {
  average_rate,
  no_evaluated_rate,
  binnary_rate,
  inverted_binnary_rate,
  evaluation_pattern_rate,
  interpolated_rate,
  proportion_rate,
};
