const {
  pavement_type_rate_pattern,
  pavement_condition_rate_pattern,
  painting_condition_rate_pattern,
  protection_conditions_rate_pattern,
  shading_rate_pattern,
  segregator_type_rate_pattern,
  project_conception_rates_pattern,
  sinuosity_rates_pattern,
  horiontal_pattern_rates_pattern,
} = require("./rates-evaluations-patterns");

const {
  average_rate,
  no_evaluated_rate,
  binnary_rate,
  inverted_binnary_rate,
  evaluation_pattern_rate,
  interpolated_rate,
  proportion_rate,
} = require("./rates-functions");

function getTitlesAndDescriptions(tree) {
  const titlesAndDescriptions = {};

  function traverse(node) {
    for (const key in node) {
      if (typeof node[key] === "object" && node[key] !== null) {
        if (node[key].title && node[key].description) {
          titlesAndDescriptions[key] = {
            title: node[key].title,
            description: node[key].description,
          };
        }
        traverse(node[key]);
      }
    }
  }

  traverse(tree);
  return titlesAndDescriptions;
}

function calculateRatesOfTree(ratesTree, initialParameters) {
  const calculatedValues = {};
  function calculateNode(nodeKey) {
    const node = ratesTree[nodeKey];
    const { rate_function, parameter_list } = node;

    if (!parameter_list || !rate_function) {
      // No calculation needed for this node
      return;
    }

    const calculatedParameters = parameter_list.map((param) => {
      if (initialParameters[param] !== undefined) {
        return initialParameters[param];
      } else if (calculatedValues[param] === undefined) {
        calculateNode(param);
      }
      return calculatedValues[param];
    });

    calculatedValues[nodeKey] = rate_function(calculatedParameters);
  }

  const sortedKeys = Object.keys(ratesTree).sort((a, b) => {
    return ratesTree[b].id.localeCompare(ratesTree[a].id);
  });

  sortedKeys.forEach(calculateNode);

  return calculatedValues;
}

function rates(parameters) {
  const {
    typology,
    flow_direction,
    traffic_flow,
    localization,
    speed_limit,
    segregator_type,
    protection_conditions_evaluation,
    access_evaluation,
    all_access_count,
    way_with_access,
    ways_without_access,
    pavement_type,
    pavement_condition_evaluation,
    sinuosity_evaluation,
    shading_evaluation,
    all_risks_situations_count,
    unevenness_obstacles, //NO FUTURO, ajustar
    all_obstacles_count,
    ridable_width,
    buffer_width,
    road_width,
    parking,
    vertical_speed_signs_count,
    horizontal_speed_sign_count,
    electronic_speed_control_count,
    other_control_elements_count,
    start_indication,
    end_indication,
    on_way_vertical_signs_count,
    crosses_with_vertical_sign_count,
    crosses_without_vertical_sign_count,
    horizontal_pattern_evaluation,
    painting_condition_evaluation,
    good_conditions_crossing_signs,
    bad_conditions_crossing_signs,
    no_visible_crossing_signs,
    good_conditions_picto_signs,
    bad_conditions_picto_signs,
    good_conditions_arrow_signs,
    bad_conditions_arrow_signs,
    dedicated_ligthing,
    same_side_ligthing,
    other_side_ligthing,
    length,

    on_way_risks_situations_count,
    crossing_risks_situations_count,
    total_unlevel_controls,
    mean_lane_width,
    mean_square_size,

    cycle_stoplight_count = 0,
    total_stoplight_count = 0,
    additional_signs_count = 0,
  } = { ...parameters };

  const rates_tree = {
    average: {
      id: "1",
      title: "Nota geral",
      description: "Nota da avaliação do trecho da estrutura",
      rate_function: average_rate,
      parameter_list: ["project", "safety", "maintenance_and_urbanity"],
    },
    project: {
      id: "1.1",
      title: "Qualidade do projeto",
      description:
        "Nota sobre as características de implantação do projeto original",
      rate_function: average_rate,
      parameter_list: [
        "protection",
        "vertical_signs",
        "horizontal_signs",
        "comfort",
      ],
    },
    protection: {
      id: "1.1.1",
      title: "Proteção contra a invasão",
      description:
        "Situação e tipo de proteção da estrutura contra a invasão de veículos motorizados.",
      rate_function: average_rate,
      parameter_list: ["project_conception", "project_risks", "segregation"],
    },
    project_conception: {
      id: "1.1.1.1",
      title: "Concepção do projeto",
      description: "Escolhas de localização, tipologia e direção da estrutura",
      rate_function: evaluation_pattern_rate,
      parameter_list: [
        project_conception_rates_pattern,
        `${flow_direction.split(" ")[0]} > ${traffic_flow} > ${localization}`,
      ],
    },
    project_risks: {
      id: "1.1.1.2",
      title: "Situações de riscos da estrutura",
      description:
        "Riscos de colisão com veículo motorizado que fatores estruturais colocam ciclistas.",
      rate_function: inverted_binnary_rate,
      parameter_list: [all_risks_situations_count],
    },
    segregation: {
      id: "1.1.1.3",
      title: "Segregação",
      description:
        "Capacidade de manter veículos motorizados longe da estrutura e incapaz de invadi-la.",
      rate_function: average_rate,
      parameter_list: [segregator_type, buffer_width],
    },
    segregation_type: {
      id: "1.1.1.3.1",
      title: "Tipo de segregador",
      description:
        "Qual foi o elemento físico escolhido para segregar a estrutura",
      rate_function: evaluation_pattern_rate,
      parameter_list: [segregator_type_rate_pattern, segregator_type],
    },
    buffer_size: {
      id: "1.1.1.3.2",
      title: "Faixa de amortecimento",
      description:
        "Largura da faixa que segrega a estrutura do fluxo motorizado.",
      rate_function: interpolated_rate,
      parameter_list: [
        1,
        buffer_width,
        [0.3, 1],
        typology.toLowerCase() != "ciclorrota",
      ],
    },
    vertical_signs: {
      id: "1.1.2",
      title: "Sinalização vertical",
      description:
        "Todas as sinalizações verticais previstas para a estrutura.",
      rate_function: average_rate,
      parameter_list: [
        "on_way_vertical_signs",
        "start_vertical_signs",
        "end_vertical_signs",
        "cross_vertical_signs",
        "stoplight",
        "additional_signs",
      ],
    },
    on_way_vertical_signs: {
      id: "1.1.2.1",
      title: "Sinalização vertical regulamentadora",
      description:
        "Quantidade de placas de sinalização horizontal regulamentadora R-34.",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        50 * on_way_vertical_signs_count,
        [150, 50],
      ],
    },
    start_vertical_signs: {
      id: "1.1.2.2",
      title: "Sinalização de início.",
      description:
        "Presença ou ausência da sinalização de início da estrutura, quando necessária.",
      rate_function: inverted_binnary_rate,
      parameter_list: [
        start_indication == "não",
        start_indication == "continua de outra estrutura",
      ],
    },
    end_vertical_signs: {
      id: "1.1.2.3",
      title: "Sinalização de fim.",
      description:
        "Presença ou ausência da sinalização de fim da estrutura, quando necessária.",
      rate_function: inverted_binnary_rate,
      parameter_list: [
        end_indication !== "não",
        end_indication == "continua de outra estrutura",
      ],
    },
    cross_vertical_signs: {
      id: "1.1.2.4",
      title: "Sinalização vertical nas travessias",
      description:
        "Relação entre a presença de sinalização vertical nas travessias e o total de travessias.",
      rate_function: proportion_rate,
      parameter_list: [
        crosses_with_vertical_sign_count,
        crosses_with_vertical_sign_count + crosses_without_vertical_sign_count,
      ],
    },
    stoplight: {
      id: "1.1.2.5",
      title: "Sinalização luminosa",
      description: "Semáforos exclusivos para ciclistas.",
      rate_function: no_evaluated_rate,
      parameter_list: [cycle_stoplight_count, total_stoplight_count],
    }, // rate_function: count_proportion
    additional_signs: {
      id: "1.1.2.6",
      title: "Sinalização complementar",
      description: "Todas as sinalizações complementares e informativas.",
      rate_function: no_evaluated_rate,
      parameter_list: [length, additional_signs_count],
    },
    horizontal_signs: {
      id: "1.1.3",
      title: "Sinalização horizontal",
      description:
        "Presença e qualidade da sinalização da horizontal da estrutura.",
      rate_function: average_rate,
      parameter_list: [
        "horizontal_pattern",
        "picto_signs",
        "arrow_signs",
        "cross_horizontal_signs",
      ],
    },
    horizontal_pattern: {
      id: "1.1.3.1",
      title: "Padrão de Sinalização Horizontal",
      description:
        "Padrão escolhido na pintura para a área de circulação da estrutura.",
      rate_function: evaluation_pattern_rate,
      parameter_list: [
        horiontal_pattern_rates_pattern,
        horizontal_pattern_evaluation,
      ],
    },
    picto_signs: {
      id: "1.1.3.2",
      title: "Pictogramas",
      description: "Quantidade de pictogramas por metro da estrutura.",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        30 * (good_conditions_picto_signs + bad_conditions_picto_signs),
        [90, 30],
      ],
    },
    arrow_signs: {
      id: "1.1.3.3",
      title: "Setas",
      description: "Quantidade de setas por metro da estrutura.",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        30 * (good_conditions_arrow_signs + bad_conditions_arrow_signs),
        [90, 30],
      ],
    },
    cross_horizontal_signs: {
      id: "1.1.3.4",
      title: "Sinalização horizontal nos cruzamentos",
      description:
        "Qualidade de manutenção e presença da sinalização horizontal nos cruzamentos.",
      rate_function: proportion_rate,
      parameter_list: [
        good_conditions_crossing_signs + bad_conditions_crossing_signs,
        good_conditions_crossing_signs +
          bad_conditions_crossing_signs +
          no_visible_crossing_signs,
      ],
    },
    comfort: {
      id: "1.1.4",
      title: "Conforto da estrutura",
      description: "Condições de conforto ao pedalar na estrutura.",
      rate_function: average_rate,
      parameter_list: [
        "access",
        "pavement",
        "sinuosity",
        "width_evaluation",
        "levels",
        "two_way",
      ],
    },
    access: {
      id: "1.1.4.1",
      title: "Acesso da estrutura",
      description: "Facilidade de acessar e sair da estrutura cicloviária",
      rate_function: interpolated_rate,
      parameter_list: [
        all_access_count,
        way_with_access + ways_without_access,
        access_evaluation == "Segregadores NÃO DIFICULTAM o acesso"
          ? [10, 10]
          : [0, 1],
        access_evaluation == "N/A",
      ],
    },
    pavement: {
      id: "1.1.4.2",
      title: "Tipo de pavimento",
      description: "Tipo do material usado no piso da estrutura",
      rate_function: evaluation_pattern_rate,
      parameter_list: [pavement_type_rate_pattern, pavement_type],
    },
    sinuosity: {
      id: "1.1.4.3",
      title: "Sinuosidade",
      description: "Estrutura tem curvas desnecessárias no trajeto",
      rate_function: evaluation_pattern_rate,
      parameter_list: [sinuosity_rates_pattern, sinuosity_evaluation],
    },
    width_evaluation: {
      id: "1.1.4.4",
      title: "Largura transitável",
      description: "Largura transitável da estrutura cicloviária",
      rate_function: interpolated_rate,
      parameter_list: [
        1,
        ridable_width,
        flow_direction.startsWith("unidirecional")
          ? ridable_width <= 1.5
            ? [1.2, 1.5, 0, 8]
            : [1.5, 2.5, 8, 10]
          : ridable_width <= 2.5
          ? [2.2, 2.5, 0, 8]
          : [2.5, 3.5, 8, 10],
        typology.toLowerCase() != "ciclorrota",
      ],
    },
    levels: {
      id: "1.1.4.5",
      title: "Desníveis",
      description: "Existência de desníveis na estrutura",
      rate_function: inverted_binnary_rate,
      parameter_list: [unevenness_obstacles !== 0],
    },

    two_way: {
      id: "1.1.4.6",
      title: "Bidirecionalidade",
      description: "Fluxo da estrutura.",
      rate_function: binnary_rate,
      parameter_list: [flow_direction.startsWith("bidirecional")],
    }, // !!
    safety: {
      id: "1.2",
      title: "Segurança viária",
      description:
        "Segurança geral viária de se transitar na via e na estrutura.",
      rate_function: average_rate,
      parameter_list: ["speed_control", "on_way_conflicts", "cross_conflicts"],
    },
    speed_control: {
      id: "1.2.1",
      title: "Controle de velocidade",
      description: "Elementos de controle de velocidade presentes na via.",
      rate_function: average_rate,
      parameter_list: [
        "electronic_control",
        "level_control",
        "unlevel_control",
      ],
    },
    electronic_control: {
      id: "1.2.1.1",
      title: "Controle eletrônico",
      description: "Presença de controle eletrônico de velocidade",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        500 * electronic_speed_control_count,
        [1000, 500],
        speed_limit > 30,
      ],
    },
    level_control: {
      id: "1.2.1.2",
      title: "Controle em nível",
      description: "Controles de velocidade no nível da via.",
      rate_function: average_rate,
      parameter_list: [
        "square_size",
        "lane_width",
        "other_controls",
        "vertical_speed_sign",
        horizontal_speed_sign,
      ],
    },
    square_size: {
      id: "1.2.1.2.1",
      title: "Tamanho de quadra",
      description: "Tamanho médio da quadra",
      rate_function: interpolated_rate,
      parameter_list: [length, mean_square_size, [300, 100]],
    },
    lane_width: {
      id: "1.2.1.2.2",
      title: "Largura de faixa",
      description: "Largura média das faixas de rolamento",
      rate_function: interpolated_rate,
      parameter_list: [mean_lane_width, 1, [3.5, 2.5]],
    },
    other_controls: {
      id: "1.2.1.2.3",
      title: "Outros controles de velocidade",
      description: "Outros elementos de controle de velocidade possíveis.",
      rate_function: binnary_rate,
      parameter_list: [other_control_elements_count !== 0],
    },
    vertical_speed_sign: {
      id: "1.2.1.2.4",
      title: "Placas de velocidade",
      description: "Quantidade de sinalização R-19  disponível na via.",
      rate_function: interpolated_rate,
      parameter_list: [length, vertical_speed_signs_count, [1, 0.1]],
    },
    horizontal_speed_sign: {
      id: "1.2.1.2.5",
      title: "Velocidade pintada no chão",
      description: "Quantidade de sinalização pintada no chão da via.",
      rate_function: interpolated_rate,
      parameter_list: [length, horizontal_speed_sign_count, [1, 0.1]],
    },
    unlevel_control: {
      id: "1.2.1.3",
      title: "Controles em desnível",
      description: "Controles de velocidade em desnível.",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        200 * total_unlevel_controls,
        [600, 200],
        speed_limit <= 30,
      ],
    },
    on_way_conflicts: {
      id: "1.2.2",
      title: "Conflitos ao longo",
      description:
        "Condições de conflitos com veículos motorizados ao longo da estrutura.",
      rate_function: average_rate,
      parameter_list: [
        "on_way_risks",
        "cyclists_conflicts",
        "on_way_main_vertical_signs",
        "horizontal_sign_conditions",
        "segregation",
      ],
    },
    on_way_risks: {
      id: "1.2.2.1",
      title: "Riscos ao longo da estrutura",
      description: "Condições de riscos ao longo da estrutura",
      rate_function: inverted_binnary_rate,
      parameter_list: [on_way_risks_situations_count],
    },
    cyclists_conflicts: {
      id: "1.2.2.2",
      title: "Conflitos com ciclistas",
      description:
        "Como a estrutura pode ampliar as chances de colisão entre ciclistas",
      rate_function: average_rate,
      parameter_list: ["width_evaluation", "two_way", "sinuosity"],
    },

    on_way_main_vertical_signs: {
      id: "1.2.2.3",
      title: "Sinalização vertical",
      description:
        "Todas as sinalizações verticais previstas para a estrutura.",
      rate_function: average_rate,
      parameter_list: ["on_way_vertical_signs", "stoplight"],
    },

    cross_conflicts: {
      id: "1.2.3",
      title: "Conflitos nos cruzamentos",
      description: "Condições de conflitos nos cruzamentos.",
      rate_function: average_rate,
      parameter_list: [
        "cross_risks",
        "project_conception",
        "horizontal_cross_conditions",
        "cross_vertical_signs",
      ],
    },
    cross_risks: {
      id: "1.2.3.1",
      title: "Riscos nos cruzamentos",
      description: "Situações de risco nos cruzamentos.",
      rate_function: inverted_binnary_rate,
      parameter_list: [crossing_risks_situations_count],
    },
    maintenance_and_urbanity: {
      id: "1.3",
      title: "Manutenção e Urbanidade",
      description: "A manutenção da estrutura e as condições de urbanidade",
      rate_function: average_rate,
      parameter_list: ["maintenance", "urbanity"],
    },
    maintenance: {
      id: "1.3.1",
      title: "Manutenção",
      description: "Manutenção da estrutura",
      rate_function: average_rate,
      parameter_list: [
        "pavement_condition",
        "horizontal_sign_conditions",
        "protection_conditions",
        "vertical_signs",
      ],
    },
    pavement_condition: {
      id: "1.3.1.1",
      title: "Situação do piso",
      description: "Qualidade de conservação do piso",
      rate_function: evaluation_pattern_rate,
      parameter_list: [
        pavement_condition_rate_pattern,
        pavement_condition_evaluation,
      ],
    },
    horizontal_sign_conditions: {
      id: "1.3.1.2",
      title: "Condição da sinalização horizontal.",
      description: "Condição de conservação da sinalização horizontal.",
      rate_function: average_rate,
      parameter_list: [
        "painting_condition",
        "picto_conditions",
        "arrow_conditions",
        "horizontal_cross_conditions",
      ],
    },
    painting_condition: {
      id: "1.3.1.2.1",
      title: "Condição da pintura interna",
      description:
        "Condição de manutenção da sinalização horizontal interna da estrutura.",
      rate_function: evaluation_pattern_rate,
      parameter_list: [
        painting_condition_rate_pattern,
        painting_condition_evaluation,
      ],
    },
    picto_conditions: {
      id: "1.3.1.2.2",
      title: "Condição dos pictogramas",
      description: "Condição de conservação dos pictogramas.",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        30 * (good_conditions_picto_signs, 0.5 * bad_conditions_picto_signs),
        [90, 30],
      ],
    },
    arrow_conditions: {
      id: "1.3.1.2.3",
      title: "Condição das setas",
      description: "Condição de conservação das setas de sinalização",
      rate_function: interpolated_rate,
      parameter_list: [
        1000 * length,
        30 * (good_conditions_arrow_signs, 0.5 * bad_conditions_arrow_signs),
        [90, 30],
      ],
    },
    horizontal_cross_conditions: {
      id: "1.3.1.2.4",
      title: "Condição da sinalização horizontal no cruzamento",
      description: "Condição de conservação da sinalização dos cruzamentos.",
      rate_function: proportion_rate,
      parameter_list: [
        good_conditions_crossing_signs + 0.5 * bad_conditions_crossing_signs,
        good_conditions_crossing_signs +
          bad_conditions_crossing_signs +
          no_visible_crossing_signs,
      ],
    },
    protection_conditions: {
      id: "1.3.1.3",
      title: "Situação da proteção",
      description:
        "Facilidade de invasão de veículos motorizados à estrutura sem transpor elementos segregatórios.",
      rate_function: evaluation_pattern_rate,
      parameter_list: [
        protection_conditions_rate_pattern,
        protection_conditions_evaluation,
      ],
    },
    urbanity: {
      id: "1.3.2",
      title: "Urbanidade",
      description:
        "Questões urbanas gerais que interferem na estrutura cicloviária.",
      rate_function: average_rate,
      parameter_list: ["obstacles", "shading", "lighting", "access"],
    },
    obstacles: {
      id: "1.3.2.1",
      title: "Obstáculos",
      description: "Quantidade de obstáculos ao longo da estrutura",
      rate_function: interpolated_rate,
      parameter_list: [
        length,
        all_obstacles_count,
        all_obstacles_count >= length ? [0, 0] : [20, 0],
      ],
    },
    shading: {
      id: "1.3.2.2",
      title: "Sombreamento",
      description: "Presença arbórea ao longo da estrutura",
      rate_function: evaluation_pattern_rate,
      parameter_list: [shading_rate_pattern, shading_evaluation],
    },
    lighting: {
      id: "1.3.2.3",
      title: "Iluminação",
      description: "Qualidade da iluminação da via e da estrutura.",
      rate_function: interpolated_rate,
      parameter_list: [
        length,
        dedicated_ligthing +
          (0.9 *
            (same_side_ligthing +
              (road_width > 1.6 * 12 ? 1 : 0.7) * other_side_ligthing)) /
            (road_width <= 12 ? 1 : 2),
        [2823, 706],
      ],
    },
  };

  return {
    titlesAndDescriptions: getTitlesAndDescriptions(rates_tree),
    rates: calculateRatesOfTree(rates_tree, parameters),
  };
}

module.exports = rates;
