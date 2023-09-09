const get_rates_tree = require("./rates-tree");
const fs = require("fs");

function calculateLeafValues(tree) {
  const calculatedValues = {};

  for (const key in tree) {
    const node = tree[key];
    if (node.parameters_leaf) {
      calculatedValues[key] = node.rate_function(node.parameters_leaf);
      // const logEntry = `${key}: ${calculatedValues[key]}: ${JSON.stringify(
      //   node.parameters_leaf
      // )},\n`;
      // fs.appendFileSync("log.json", logEntry);
    }
  }

  return calculatedValues;
}

function calculateBranchValuesRecursively(tree, leafValues, nodeId) {
  const node = tree[nodeId];
  if (!node) {
    return undefined; // Nó não encontrado na árvore
  }
  if (node.parameters_branch) {
    const params_values = node.parameters_branch.map((p) => {
      const childValue = calculateBranchValuesRecursively(tree, leafValues, p);
      return childValue !== undefined ? childValue : leafValues[p];
    });
    return node.rate_function(params_values);
  }
  return undefined; // Nó não é um galho
}

function calculateBranchValues(tree, leafValues) {
  const branchValues = {};
  for (const nodeId in tree) {
    const node = tree[nodeId];
    const calculatedValue = calculateBranchValuesRecursively(
      tree,
      leafValues,
      nodeId
    );
    if (calculatedValue !== undefined) {
      branchValues[nodeId] = calculatedValue;
    }
  }
  return branchValues;
}

function getFormRates(parameters) {
  const tree = get_rates_tree(parameters);
  // Calcula os valores das folhas
  const leafValues = calculateLeafValues(tree);
  // Calcula os valores dos galhos usando os valores das folhas
  const branchValues = calculateBranchValues(tree, leafValues);
  // Combine os valores das folhas e galhos em um único objeto
  const calculatedValues = { ...leafValues, ...branchValues };
  return calculatedValues;
}

function calculateSegmentedRates(all_forms) {
  const all_rates = {};
  for (const form in all_forms) {
    const rates = getFormRates(all_forms[form]);
    const geo_id = all_forms[form].geo_id;
    const length = all_forms[form].seg_length;
    all_rates[form] = {
      form_id: all_forms[form].form_id,
      geo_id: geo_id,
      length: length,
      rates: rates,
      form: all_forms[form],
    };
  }
  return all_rates;
}

function calculateGroupedRates(all_forms) {
  const segment_rates = calculateSegmentedRates(all_forms);

  const grouped_rates_acc = {};
  for (const form of all_forms) {
    const { geo_id, length, rates, form_id } = { ...segment_rates[form] };
    if (!grouped_rates_acc[geo_id]) {
      grouped_rates_acc[geo_id] = {
        total_length: 0,
        rates: {},
        forms_id: [],
      };
    }
    const group = grouped_rates_acc[geo_id];
    group.forms_id.push(form_id);
    group.total_length += length;
    for (const rate in rates) {
      const value = rates[rate];
      if (!group.rates[rate]) {
        group.rates[rate] = 0;
      }
      group.rates[rate] += value * length;
    }
  }

  const grouped_rates = {};
  for (group in grouped_rates_acc) {
    const { total_length, rates } = grouped_rates_acc[group];
    const group_rates = {};
    for (const rate in rates) group_rates[rate] = rates[rate] / total_length;
    grouped_rates[group] = {
      geo_id: group,
      length: total_length,
      forms_id: forms_id,
      form: "all_forms[form].form",
      rates: group_rates,
    };
  }

  return grouped_rates;
}

module.exports = {
  calculateSegmentedRates,
  calculateGroupedRates,
};
