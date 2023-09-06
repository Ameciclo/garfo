const pavement_type_rate_pattern = {
  "Não há, estrutura sobre a calçada": 10,
  "Canteiros, Prismas ou blocos de concreto, Sinalização com pintura": 10,
  "Canteiros, Balizadores": 10,
  Canteiros: 10,
  "Guias, Sinalização com pintura": 8,
  Guias: 8,
  "Prismas ou blocos de concreto, Sinalização com pintura": 6,
  "Prismas ou blocos de concreto": 6,
  "Sinalização com pintura, Tachas ou tachões, Balizadores": 4,
  "Sinalização com pintura, Tachas ou tachões": 4,
  "Tachas ou tachões": 4,
  "Sinalização com pintura": 2,
  "Sinalização com pintura, Não há": 2,
  "Não há": 0,
  Ciclorrota: -1,
};

const pavement_condition_rate_pattern = {
  "Bom estado": 10,
  "Pequenas imperfeições, como fissuras": 8,
  "Falhas que demandam redução de velocidade ou parada": 6,
  "Irregularidades que demandam desvio para circulação": 4,
  "Buracos grandes que demandam saída a estrutura": 2,
  "Totalmente destruído, impossível transitar": 0,
};

const painting_condition_rate_pattern = {
  "A pintura está boa, COMPLETA e visível": 10,
  "A pintura está boa, mas FALHA em ALGUNS pontos": 8,
  "A pintura é falha em VÁRIOS pontos": 4,
  "A pintura é MUITO falha, mostrando muito asfalto": 2,
  "Pintura APAGADA ou somente rastros de tinta": 0,
};

const segregator_type_rate_pattern = {
  "Não há, estrutura sobre a calçada": 10,
  "Canteiros, Prismas ou blocos de concreto, Sinalização com pintura": 10,
  "Canteiros, Balizadores": 10,
  Canteiros: 10,
  "Guias, Sinalização com pintura": 8,
  Guias: 8,
  "Prismas ou blocos de concreto, Sinalização com pintura": 6,
  "Prismas ou blocos de concreto": 6,
  "Sinalização com pintura, Tachas ou tachões, Balizadores": 4,
  "Sinalização com pintura, Tachas ou tachões": 4,
  "Tachas ou tachões": 4,
  "Sinalização com pintura": 2,
  "Sinalização com pintura, Não há": 2,
  "Não há": 0,
  Ciclorrota: -1,
};

const protection_conditions_rate_pattern = {
  "SE CICLOVIA, segregação impede completamente a invasão de automóvel e não há trechos desprotegidos": 10,
  "SE CICLOFAIXA, impossível automóvel invadir a estrutura sem ultrapassar por segregadores": 10,
  "Poucos trechos SEM segregadores dificultando invasão": 6.6,
  "Poucos trechos COM segregadores dificultando invasão": 3.3,
  "NENHUM ou QUASE NENHUM segregador dificultando invasão": 0,
  Ciclorrota: -1,
};

const shading_rate_pattern = {
  "Sombras na MAIOR PARTE da extensão": 10,
  "Sombras em PRATICAMENTE TODA a extensão": 8,
  "Sombras em alguns trechos, COM mudas plantadas": 6,
  "Sombras em alguns trechos, SEM mudas novas": 4,
  "Somente mudas novas": 2,
  "Não há árvores nem mudas": 0,
};

const horiontal_pattern_rates_pattern = {
  "Toda área de circulação pintada de vermelho": 10,
  "Pintada de vermelho com interrupções": 6.7,
  "Apenas faixas vermelhas nas bordas, com travessias pintadas nos cruzamentos": 3.3,
  "Apenas faixas vermelhas nas bordas.": 0,
  Ciclorrota: -1,
};

const sinuosity_rates_pattern = {
  "O traçado é completamente reto": 10,
  "O traçado é sinuoso, exigindo atenção": 6.6,
  "O traçado é muito sinuoso, podendo causar colisões com obstáculos ou outros ciclistas em momento de ultrapassagem": 3.3,
  "O traçado é muito sinuoso ou possui curvas com obstáculos que impedem visualização de entorno ou parte da estrutura": 0,
};

let project_conception_rates_pattern = {
  bidirecional: {
    "Mão única": {
      "Isoladas (em área verde)": 10,
      "No bordo esquerdo da via de mão única": 7.5,
      "Na via, junto ao canteiro central/canal": 5,
      "No canteiro central": 5,
      "Sobre a calçada": 2.5,
      "No bordo direito da via de mão única": 0,
      Ciclorrota: -1,
      "Em um dos bordos de via de mão dupla": -1,
    },
    "Mão dupla": {
      "Isoladas (em área verde)": 10,
      "Sobre a calçada": 5,
      "Na via, junto ao canteiro central/canal": 5,
      "No canteiro central": 5,
      "Em um dos bordos de via de mão dupla": 0,
      "No bordo direito da via de mão única": -1,
      "No bordo esquerdo da via de mão única": -1,
      Ciclorrota: -1,
    },
  },
  unidirecional: {
    "Mão única": {
      "Isoladas (em área verde)": 10,
      "No bordo esquerdo da via de mão única": 7.5,
      "No bordo direito da via de mão única": 7.5,
      "Na via, junto ao canteiro central/canal": 5,
      "No canteiro central": 5,
      "Sobre a calçada": 2.5,
      Ciclorrota: -1,
      "Em um dos bordos de via de mão dupla": -1,
    },
    "Mão dupla": {
      "Isoladas (em área verde)": 10,
      "Em um dos bordos de via de mão dupla": 7.5,
      "Na via, junto ao canteiro central/canal": 5,
      "No canteiro central": 5,
      "Sobre a calçada": 2.5,
      "No bordo direito da via de mão única": -1,
      "No bordo esquerdo da via de mão única": -1,
      Ciclorrota: -1,
    },
  },
};

const flattenedRates = {};

for (const cycle_flow in project_conception_rates_pattern) {
  for (const traffic_flow in project_conception_rates_pattern[cycle_flow]) {
    for (const localization in project_conception_rates_pattern[cycle_flow][
      traffic_flow
    ]) {
      const key = `${cycle_flow} > ${traffic_flow} > ${localization}`;
      const rating =
        project_conception_rates_pattern[cycle_flow][traffic_flow][
          localization
        ];
      flattenedRates[key] = rating;
    }
  }
}

project_conception_rates_pattern = flattenedRates;

module.exports = {
  sinuosity_rates_pattern,
  pavement_type_rate_pattern,
  pavement_condition_rate_pattern,
  painting_condition_rate_pattern,
  segregator_type_rate_pattern,
  protection_conditions_rate_pattern,
  shading_rate_pattern,
  project_conception_rates_pattern,
  horiontal_pattern_rates_pattern,
};