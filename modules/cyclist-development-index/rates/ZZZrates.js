const average = [
  "Nota geral",
  "Nota da avaliação do trecho da estrutura",
  calculate_average,
  [project, safety, maintenance_and_urbanity],
];
const project = [
  "Qualidade do projeto",
  "Nota sobre as características de implantação do projeto original",
  calculate_average,
  [protection, vertical_signs, horizontal_signs, comfort],
];
const protection = [
  "Proteção contra a invasão",
  "Situação e tipo de proteção da estrutura contra a invasão de veículos motorizados.",
  calculate_average,
  [project_conception, project_risks, segregation],
];
const project_conception = [
  "project_conception",
  "Concepção do projeto",
  "Escolhas de localização, tipologia e direção da estrutura",
  calculate_project_conception,
  [track_flow, cycle_flow, cycle_localization],
];
const project_risks = [
  "Situações de riscos da estrutura",
  "Riscos de colisão com veículo motorizado que fatores estruturais colocam ciclistas.",
  calculate_project_risks,
  [total_risks_situations],
];
const segregation = [
  "Segregação",
  "Capacidade de manter veículos motorizados longe da estrutura e incapaz de invadi-la.",
  calculate_average,
  [segregation_type, buffer_size],
];
const segregation_type = [
  "Tipo de segregador",
  "Qual foi o elemento físico escolhido para segregar a estrutura",
  calculate_segregation_type,
  [segregator_type],
];
const buffer_size = [
  "Faixa de amortecimento",
  "Largura da faixa que segrega a estrutura do fluxo motorizado.",
  calculate_buffer_size,
  [buffer_width],
];
const vertical_signs = [
  "Sinalização vertical",
  "Todas as sinalizações verticais previstas para a estrutura.",
  calculate_average,
  [
    on_way_vertical_signs,
    start_vertical_signs,
    end_vertical_signs,
    cross_vertical_signs,
    stoplight,
    additional_signs,
  ],
];
const on_way_vertical_signs = [
  "Sinalização vertical regulamentadora",
  "Quantidade de placas de sinalização horizontal regulamentadora R-34.",
  calculate_vertical_signs,
  [length, vertical_signs_count],
];
const start_vertical_signs = [
  "Sinalização de início.",
  "Presença ou ausência da sinalização de início da estrutura, quando necessária.",
  calculate_start_vertical_signs,
  [start_vertical_signs_count],
];
const end_vertical_signs = [
  "Sinalização de fim.",
  "Presença ou ausência da sinalização de fim da estrutura, quando necessária.",
  calculate_end_vertical_signs,
  [end_horizontal_sign_count],
];
const cross_vertical_signs = [
  "Sinalização vertical nas travessias",
  "Relação entre a presença de sinalização vertical nas travessias e o total de travessias.",
  calculate_cross_vertical_signs,
  [cross_with_vertical_sign, total_crosses],
];
const stoplight = [
  "Sinalização luminosa",
  "Semáforos exclusivos para ciclistas.",
  calculate_stoplight,
  [stoplight, total_crosses],
];
const additional_signs = [
  "Sinalização complementar",
  "Todas as sinalizações complementares e informativas.",
  calculate_additional_signs,
  [additional_signs_count, length],
];
const horizontal_signs = [
  "Sinalização horizontal",
  "Presença e qualidade da sinalização da horizontal da estrutura.",
  calculate_average,
  [
    horizontal_pattern,
    sinalizacao_horizonal_cruzamentos_,
    pictogramas_,
    setas_,
  ],
];
const horizontal_pattern = [
  "Padrão de Sinalização Horizontal",
  "Padrão escolhido na pintura para a área de circulação da estrutura.",
  calculate_horiontal_pattern,
  [horiontal_pattern_description],
];
const picto_signs = [
  "Pictogramas",
  "Quantidade de pictogramas por metro da estrutura.",
  calculate_picto_existence,
  [good_conditions_picto_signs, bad_conditions_picto_signs, length],
];
const arrow_signs = [
  "Setas",
  "Quantidade de setas por metro da estrutura.",
  setas_,
  [good_conditions_arrow_signs, bad_conditions_arrow_signs, length],
];
const cross_hor_signs = [
  "Sinalização horizontal nos cruzamentos",
  "Qualidade de manutenção e presença da sinalização horizontal nos cruzamentos.",
  sinalizacao_horizonal_cruzamentos_,
  [
    good_conditions_crossing_signs,
    bad_conditions_crossing_signs,
    no_crossing_signs,
  ],
];
const comfort = [
  "Conforto da estrutura",
  "Condições de conforto ao pedalar na estrutura.",
  calculate_average,
  [access, pavement, sinuosity, width, levels, two_way],
];
const access = [
  "Acesso da estrutura",
  "Facilidade de acessar e sair da estrutura cicloviária",
  calculate_access,
  [way_with_access, ways_without_access, total_access, acessibility_evaluation],
];
const pavement = [
  "Tipo de pavimento",
  "Tipo do material usado no piso da estrutura",
  calculate_pavement,
  [pavement_type],
];
const sinuosity = [
  "Sinuosidade",
  "Estrutura tem curvas desnecessárias no trajeto",
  calculate_sinuosity,
  [sinuosity_evaluation],
];
const width = [
  "Largura transitável",
  "Largura transitável da estrutura cicloviária",
  calculate_width_evaluation,
  [cycle_flow, width, typology],
];
const levels = [
  "Desníveis",
  "Existência de desníveis na estrutura",
  calculate_levels,
  [levels_count, length],
];
const two_way = [
  "Bidirecionalidade",
  "Fluxo da estrutura.",
  calculate_two_way,
  [cycle_flow],
];
const /////////
  safety = [
    "Segurança viária",
    "Segurança geral viária de se transitar na via e na estrutura.",
    calculate_average,
    [speed_control, on_way_conflicts, cross_conflicts],
  ];
const speed_control = [
  "Controle de velocidade",
  "Elementos de controle de velocidade presentes na via.",
  calculate_average,
  [electronic_control, level_control, unlevel_control],
];
const electronic_control = [
  "Controle eletrônico",
  "Presença de controle eletrônico de velocidade",
  calculate_electronic_control,
  [speed_limit, length, control_points],
];
const level_control = [
  "Controle em nível",
  "Controles de velocidade no nível da via.",
  calculate_average,
  [
    square_size,
    lane_width,
    other_controls,
    vertical_speed_sign,
    horizontal_speed_sign,
  ],
];
const square_size = [
  "Tamanho de quadra",
  "Tamanho médio da quadra",
  calculate_square_mean_size,
  [length, number_of_squares],
];
const lane_width = [
  "Largura de faixa",
  "Largura média das faixas de rolamento",
  calculate_lane_width,
  [road_width, number_of_lanes, parking_type, cycle_width],
];
const other_controls = [
  "Outros controles de velocidade",
  "Outros elementos de controle de velocidade possíveis.",
  calculate_other_controls,
  [speed_limit, other_controls],
];
const vertical_speed_sign = [
  "Placas de velocidade",
  "Quantidade de sinalização R-19  disponível na via.",
  calculate_vertical_speed_signs,
  [length, total_vertical_speed_signs],
];
const horizontal_speed_sign = [
  "Velocidade pintada no chão",
  "Quantidade de sinalização pintada no chão da via.",
  calculate_horizontal_speed_signs,
  [length, total_horizontal_signs],
];
const unlevel_control = [
  "Controles em desnível",
  "Controles de velocidade em desnível.",
  calculate_unlevel_controls,
  [speed_limit, length, total_unlevel_controls],
];
const on_way_conflicts = [
  "Conflitos ao longo",
  "Condições de conflitos com veículos motorizados ao longo da estrutura.",
  calculate_average,
  [
    on_the_way_risks,
    segregation,
    vertical_signs_existence,
    horizontal_sign_conditions,
    cyclists_conflicts,
  ],
];
const on_the_way_risks = [
  "Riscos ao longo da estrutura",
  "Condições de riscos ao longo da estrutura",
  calculate_on_the_way_risks,
  [on_way_risks_situations, length],
];
const cyclists_conflicts = [
  "Conflitos com ciclistas",
  "Como a estrutura pode ampliar as chances de colisão entre ciclistas",
  calculate_average,
  [width, two_way, sinuosity],
];
const cross_conflict = [
  "Conflitos nos cruzamentos",
  "Condições de conflitos nos cruzamentos.",
  calculate_average,
  [
    project_conception,
    cross_risks,
    horizontal_cross_conditions,
    cross_vertical_signs,
  ],
];
const cross_risks = [
  "Riscos nos cruzamentos",
  "Situações de risco nos cruzamentos.",
  calculate_cross_risks,
  [cross_risks_situations, length],
];
const maintenance_and_urbanity = [
  "Manutenção e Urbanidade",
  "A manutenção da estrutura e as condições de urbanidade",
  calculate_average,
  [maintenance, urbanity],
];
const maintenance = [
  "Manutenção",
  "Manutenção da estrutura",
  calculate_average,
  [
    pavement_condition,
    horizontal_sign_conditions,
    vertical_signs_existence,
    protection_conditions,
  ],
];
const protection_conditions = [
  "Situação da proteção",
  "Facilidade de invasão de veículos motorizados à estrutura sem transpor elementos segregatórios.",
  calculate_protection_conditions,
  [protection_conditions_evaluation],
];
const pavement_condition = [
  "Situação do piso",
  "Qualidade de conservação do piso",
  calculate_pavement_condition,
  [pavement_condition_evaluation],
];
const obstacles = [
  "Obstáculos",
  "Quantidade de obstáculos ao longo da estrutura",
  calculate_obstacles,
  [total_obstacles, length],
];
const vertical_signs_existence = [
  "Existência da sinalização vertical",
  "Existência da sinalização vertical ao longo e nos cruzamentos da estrutura.",
  calculate_vert_signs_existence,
  [vertical_signs, length],
];
const horizontal_sign_conditions = [
  "Condição da sinalização horizontal",
  "Condição de conservação da sinalização horizontal.",
  calculate_average,
  [
    painting_condition,
    picto_conditions,
    arrow_conditions,
    horizontal_cross_conditions,
  ],
];
const painting_condition = [
  "Condição da pintura interna",
  "Condição de manutenção da sinalização horizontal interna da estrutura.",
  calculate_painting_condition,
  [painting_condition_evaluation],
];
const picto_conditions = [
  "Condição dos pictogramas",
  "Condição de conservação dos pictogramas.",
  calculate_picto_conditions,
  [good_conditions_picto_signs, bad_conditions_picto_signs, length],
];
const arrow_conditions = [
  "Condição das setas",
  "Condição de conservação das setas de sinalização",
  calculate_arrow_conditions,
  [good_conditions_arrow_signs, bad_conditions_arrow_signs, length],
];
const horizontal_cross_conditions = [
  "Condição da sinalização horizontal no cruzamento",
  "Condição de conservação da sinalização dos cruzamentos.",
  calculate_horizontal_cross_conditions,
  [
    good_conditions_crossing_signs,
    bad_conditions_crossing_signs,
    no_crossing_signs,
  ],
];
const urbanity = [
  "Urbanidade",
  "Questões urbanas gerais que interferem na estrutura cicloviária.",
  calculate_average,
  [shading, lighting, obstacles, acessibilidade],
];
const shading = [
  "Sombreamento",
  "Presença arbórea ao longo da estrutura",
  calculate_shading,
  [shanding_evaluation],
];
const lighting = [
  "Iluminação",
  "Qualidade da iluminação da via e da estrutura.",
  calculate_lighting,
  [dedicated_ligthing, same_side_ligthing, other_side_ligthing, length],
];
