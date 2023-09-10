const { interpolation } = require("../../../commons/utils");

function average_rate(arr) {
  let sum = null;
  let count = 0;
  arr.forEach((f) => {
    if (f != null) {
      sum += f;
      count++;
    }
  });
  if (count > 0 && sum != null) return sum / count;
  else return null;
}

function no_evaluated_rate(arr) {
  return null;
}

function binary_rate({ count, skip = false, inverted = false }) {
  if (!skip) {
    if (count > 0) return inverted ? 0 : 10;
    return inverted ? 10 : 0;
  }
  return null;
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
      (desc) => pattern[desc] || null
    );
    return average_rate(pattern_descriptions);
  } else if (separator) {
    const all_descriptions = description.split(separator).map((f) => f.trim());
    const pattern_descriptions = all_descriptions.map(
      (desc) => pattern[desc] || null
    );
    return average_rate(pattern_descriptions);
  } else {
    return pattern[description] || null;
  }
}

////////
function interpolated_rate({ x, x0, x1, y0 = 0, y1 = 10, skip = false }) {
  if (skip) return null;
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
  return null;
}

module.exports = {
  average_rate,
  no_evaluated_rate,
  binary_rate,
  pattern_rate,
  interpolated_rate,
  proportional_rate,
};
