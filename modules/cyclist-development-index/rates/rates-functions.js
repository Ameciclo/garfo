const { interpolation } = require("../../../commons/utils");

function average_rate(arr) {
  let sum = 0;
  let count = 0;
  arr.forEach((f) => {
    if (f.average != -1) {
      sum += f.average;
      count++;
    }
  });
  if (count > 0 && sum > -1) return Math.round((sum / count) * 10) / 10;
  else return -1;
}

function no_evaluated_rate(arr) {
  return -1;
}

function binary_rate({ count, skip = false, inverted = false }) {
  if (skip) {
    if (count > 0) return inverted ? 0 : 10;
    return inverted ? 10 : 0;
  }
  return -1;
}

function pattern_rate({ pattern, description }) {
  return pattern[description] || -1;
}

////////
function interpolated_rate({ x, x0, x1, y0 = 0, y1 = 10, skip = false }) {
  if (skip) return -1;
  let y = interpolation(x, x0, x1, y0, y1);
  if (y > y1) {
    y = y1;
  } else if (y < y0) {
    y = y0;
  }
  return y;
}

function proportional_rate({ count, total }) {
  if (total != 0) return (count / total) * 10;
  return -1;
}

module.exports = {
  average_rate,
  no_evaluated_rate,
  binary_rate,
  pattern_rate,
  interpolated_rate,
  proportional_rate,
};
