const { saveAs } = require("file-saver");

function downloadObjectAsJson(data, fileName) {
  fileName += ".geojson";
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/geo+json",
    name: fileName,
  });
  saveAs(blob, fileName);
}

// Thanks https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function slugify(str) {
  const a = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;";
  const b = "aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------";
  const p = new RegExp(a.split("").join("|"), "g");
  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with ‘and’
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

////////
function get_average(arr) {
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

////////
function interpolation(x, x1, x2, y1 = 0, y2 = 10) {
  let a = (y1 - y2) / (x1 - x2);
  let b = (x1 * y2 - x2 * y1) / (x1 - x2);
  let y = a * x + b;
  if (y > y2) {
    y = y2;
  } else if (y < y1) {
    y = y1;
  }
  return Math.round(y * 10) / 10;
}

////////
function interpolation(x, x1, x2, y1 = 0, y2 = 10) {
  let a = (y1 - y2) / (x1 - x2);
  let b = (x1 * y2 - x2 * y1) / (x1 - x2);
  let y = a * x + b;
  if (y > y2) {
    y = y2;
  } else if (y < y1) {
    y = y1;
  }
  return Math.round(y * 10) / 10;
}


module.exports = {
  get_average,
  interpolation,
  downloadObjectAsJson,
  slugify,
};
