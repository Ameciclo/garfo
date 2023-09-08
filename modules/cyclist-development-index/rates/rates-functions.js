const { interpolation } = require("../../../commons/utils");

function average_rate(arr) {
  let sum = 0;
  let count = 0;
  arr.forEach((f) => {
    if (f != -1) {
      sum += f;
      count++;
    }
  });
  if (count > 0 && sum > -1) return sum / count;
  else return -1;
}

function no_evaluated_rate(arr) {
  return -1;
}

function binary_rate({ count, skip = false, inverted = false }) {
  if (!skip) {
    if (count > 0) return inverted ? 0 : 10;
    return inverted ? 10 : 0;
  }
  return -1;
}

function pattern_rate({
  pattern,
  description,
  separator = undefined,
  combined_skip = undefined,
}) {
  if (combined_skip && description && separator) {
    const all_descriptions = description.split(separator).map((f) => f.trim());
    const descriptionsToCheck = all_descriptions.filter(
      (desc) => !combined_skip.includes(desc)
    );
    const pattern_descriptions = descriptionsToCheck.map(
      (desc) => pattern[desc] || -1
    );
    return average_rate(pattern_descriptions);
  } else if (separator) {
    const all_descriptions = description.split(separator).map((f) => f.trim());
    const pattern_descriptions = all_descriptions.map(
      (desc) => pattern[desc] || -1
    );
    return average_rate(pattern_descriptions);
  } else {
    return pattern[description] || -1;
  }
}

////////
function interpolated_rate({ x, x0, x1, y0 = 0, y1 = 10, skip = false }) {
  if (skip) return -1;
  let y = interpolation(x, x0, x1, y0, y1);
  if (y > 10) {
    y = 10;
  } else if (y < 0) {
    y = 0;
  }
  return y;
}

function proportional_rate({ count, total, skip = false }) {
  if (total != 0 && !skip) return (count / total) * 10;
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
