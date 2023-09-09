const get_rates_tree = require("./rates-tree");
// const fs = require("fs");

function calculateLeafValues(tree) {
  const calculatedValues = {};

  for (const key in tree) {
    const node = tree[key];
    if (node.parameters_leaf) {
      calculatedValues[key] = node.rate_function(node.parameters_leaf);
      // const logEntry = `${calculatedValues[key]}: ${JSON.stringify(node)},\n`;
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
  // const logEntry = `${parameters.section_name},\n`;
  // fs.appendFileSync("log.json", logEntry);
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
    const { form_id, geo_id, seg_length } = { ...all_forms[form] };
    all_rates[form] = {
      form_id: form_id,
      geo_id: geo_id,
      seg_length: seg_length,
      rates: rates,
      //      form: all_forms[form],
    };
  }
  return all_rates;
}

function calculateGroupedRates(all_forms) {
  const segmentRates = calculateSegmentedRates(all_forms);

  const groupedRatesAccumulated = {};
  for (const form in all_forms) {
    const { geo_id, seg_length, rates, form_id } = { ...segmentRates[form] };
    if (!groupedRatesAccumulated[geo_id]) {
      groupedRatesAccumulated[geo_id] = {
        total_length: 0,
        rates: {},
        form_ids: [],
      };
    }
    groupedRatesAccumulated[geo_id].form_ids.push(form_id);
    groupedRatesAccumulated[geo_id].total_length += seg_length;
    for (const rate in rates) {
      const value = rates[rate];
      if (!groupedRatesAccumulated[geo_id].rates[rate]) {
        groupedRatesAccumulated[geo_id].rates[rate] = 0;
      }
      groupedRatesAccumulated[geo_id].rates[rate] += value * seg_length;
    }
  }
  const groupedRatesAverages = {};
  for (const group in groupedRatesAccumulated) {
    const groupRatesAvg = {};
    for (const rate in groupedRatesAccumulated[group].rates) {
      groupRatesAvg[rate] =
        groupedRatesAccumulated[group].rates[rate] /
        groupedRatesAccumulated[group].total_length;
    }

    groupedRatesAverages[group] = {
      ...groupedRatesAccumulated[group],
      rates: groupRatesAvg,
    };
  }

  return groupedRatesAverages;
}

module.exports = {
  calculateSegmentedRates,
  calculateGroupedRates,
};
