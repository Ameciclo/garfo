const get_rates_tree = require("./rates-tree");

function convertObjectToTitleArray(object) {
  const titleArray = [];

  for (const id in object) {
    if (object.hasOwnProperty(id)) {
      const title = object[id];
      titleArray.push({ key: id, ...title });
    }
  }

  return titleArray;
}

function formatTitleTree(tree, idCount = {}) {
  let formatted = "";

  function generateId(id, count) {
    return `${id}.${count}`;
  }

  function traverse(node, id) {
    let count = idCount[id] || 1;
    idCount[id] = count;

    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const childId = generateId(id, count);
        const nodeItem = node[key];
        if (nodeItem.title) {
          formatted += `${childId}: ${nodeItem.title}\n`;
          count++;
        }

        if (Object.keys(nodeItem).length > 1) {
          traverse(nodeItem, childId);
        }
      }
    }
  }

  traverse(tree, 0);
  return formatted;
}

function buildTitleTree(parameters) {
  const idsAndTitles = convertObjectToTitleArray(get_rates_tree(parameters));
  const titleTree = {};

  idsAndTitles.forEach((item) => {
    const parts = item.id.split(".");
    let currentNode = titleTree;

    parts.forEach((part, index) => {
      if (!currentNode[part]) {
        currentNode[part] = {};
      }

      currentNode = currentNode[part];

      if (index === parts.length - 1) {
        // Último nó, adicione o título
        currentNode.title = item.title;
        if (item.parameters_leaf) currentNode.leafs = item.id;
        if (item.parameters_branch)
          currentNode.leafs = "" + item.parameters_branch;
      }
    });
  });

  console.log(formatTitleTree(titleTree));
  return titleTree;
}

function getTitlesAndDescriptions(parameters) {
  const tree = get_rates_tree(parameters);
  const titlesAndDescriptions = {};

  function traverse(node) {
    for (const key in node) {
      if (typeof node[key] === "object" && node[key] !== null) {
        if (node[key].title && node[key].description) {
          titlesAndDescriptions[key] = {
            id: node[key].id,
            title: node[key].title,
            description: node[key].description,
            rate_function: JSON.stringify(node[key].rate_function),
            parameter_list: JSON.stringify(node[key].parameter_list),
          };
        }
        traverse(node[key]);
      }
    }
  }

  traverse(tree);
  return titlesAndDescriptions;
}

module.exports = { getTitlesAndDescriptions, buildTitleTree };
