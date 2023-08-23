const express = require("express");
const data = require("./rates-tree.js");
const app = express();
const PORT = 3000;

function sortByLengthAndNumeric(a, b) {
  if (a[0].length < b[0].length) {
    return 1;
  } else if (a[0].length > b[0].length) {
    return -1;
  } else {
    return a[0].localeCompare(b[0], undefined, { numeric: true });
  }
}

const orderedData = data.sort(sortByLengthAndNumeric);

function getChildren(nodeId) {
  return orderedData.filter(
    (item) =>
      item[0].startsWith(nodeId + ".") &&
      item[0].split(".").length === nodeId.split(".").length + 1
  );
}

function calculateValue(nodeId) {
  let node = orderedData.find((item) => item[0] === nodeId);
  console.log("node ", node);
  if (!node) {
    return 0;
  }
  let children = getChildren(nodeId);
  console.log("children", children)

  if (children.length === 0) {
    const fun = node[4]
    return node[5];
  } else {
    let sum = children.reduce(
      (acc, childNode) => acc + calculateValue(childNode[0]),
      0
    );
    return sum / children.length;
  }
}

let result = {};
result["ideciclo"] = calculateValue(orderedData.find((item) => item[0] == "1")[0]);

// orderedData.forEach((node) => {
//   result[node[1]] = calculateValue(node[0]);
// });

app.get("/value", (req, res) => {
  res.send(`Valor da raiz: ${JSON.stringify(result)}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
