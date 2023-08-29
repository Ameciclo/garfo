const { reverseConversion } = require("../../../commons/utils");

const conversion = {
  timestamp: "Carimbo de data/hora",
  evaluator_1: "Avaliador(a) 1",
  evaluator_2: "Avaliador(a) 2",
  date: "Data",
  start_time: "Hora Início",
  street: "Via",
  section_start: "Início do trecho",
  section_end: "Fim do trecho",
  typology: "1. TIPO DE ESTRUTURA",
  flow_direction: "2. FLUXO DA ESTRUTURA",
  traffic_flow: "3. FLUXO DA VIA",
  localization: "4. LOCALIZAÇÃO DA ESTRUTURA",
  speed_limit: "Velocidade máxima (km/h)",
  segregator_type: "6. TIPO DE SEGREGADORES",
  protection_conditions_evaluation: "7. PROTEÇÃO CONTRA INVASÃO DE AUTOMÓVEL",
  access_evaluation: "8.1 Segregadores",
  all_access_count: "Qtde de acessos:",
  way_with_access: "Qtde Vias transversais COM acesso:",
  ways_without_access: "Qtde Vias transversais SEM acesso:",
  pavement_type: "9.1 Tipo de pavimento",
  pavement_condition_evaluation: "9.2 Situação de conservação do pavimento",
  sinuosity_evaluation: "10. SINUOSIDADE",
  shading_evaluation: "11. SOMBREAMENTO",
  car_risk_situations: "12. SITUAÇÕES DE RISCO (RELATIVAS A AUTOMÓVEIS)",
  bus_stops_along: "Paradas de ônibus ao longo",
  crossings_no_speed_reduction:
    "Cruzamentos com veículos em curva de ângulo aberto e sem tratamento de redução de velocidade",
  conversion_path_allows_car_intrusion:
    "Trajeto de conversão permite invasão de automóvel de trecho de linha contínua da estrutura",
  structure_side_change_without_speed_reducers_or_lights:
    "Troca lado da estrutura sem redutores de velocidade ou semáforos",
  car_turning_left_with_cyclist_invisibility:
    "Conversão à esquerda de automóvel com invisibilidade de ciclista",
  structure_abrupt_end_in_counterflow:
    "Fim repentino de estrutura no contrafluxo",
  other_car_risk_situations: "Outros",
  all_risks_situations_count: "Total de situações de risco",
  permanent_obstacles_asphalt_related:
    "13. OBSTÁCULOS PERMANENTES (RELATIVOS AO ASFALTO)",
  manhole_covers: "Bueiros",
  roots: "Raízes",
  potholes: "Buracos",
  deep_gutters_along_structure: "Valas profundas ao longo da estrutura",
  unevenness_obstacles: "Desníveis", //
  other_obstacles: "Outros",
  all_obstacles_count: "Total de obstáculos",
  if_gutters_width: "Se valas, largura desta",
  ridable_width: "Largura da área transitável da estrutura (metros):",
  buffer_width: "Largura da faixa de amortecimento da estrutura (cm):",
  side_lane_width:
    "Largura da faixa de rolamento contígua à estrutura (metros):",
  road_width: "Largura total da VIA incluindo a estrutura (metros):",
  parking: "Estacionamento:",
  max_speed_control: "15. CONTROLE DA VELOCIDADE MÁXIMA DA VIA",
  vertical_speed_signs_count: "Sinalização VERTICAL. Qtde",
  horizontal_speed_sign_count: "Sinalização HORIZONTAL. Qtde",
  pedestrian_crossings_count: "Travessia de pedestre em nível. Qtde",
  speed_bumps_count: "Lombadas físicas. Qtde",
  electronic_speed_control_count: "Radar/Lombada Eletrônica. Qtde",
  other_control_elements_count: "Outros elementos (nome do elemento e Qtde)",
  start_indication: "16.1 Indicação de início (placa R-34)",
  end_indication: "16.2 Indicação de fim (placa R-34)",
  on_way_vertical_signs_count:
    "16.3 Indicação AO LONGO da estrutura (placa R-34). Qtde:",
  crosses_with_vertical_sign_count:
    "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias COM",
  crosses_without_vertical_sign_count:
    "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias SEM",
  horizontal_pattern_evaluation: "17.1 Padrão de pintura vermelha",
  painting_condition_evaluation: "17.2 Situação da pintura vermelha",
  good_conditions_crossing_signs: "Existem, em boas condições. Qtde:",
  bad_conditions_crossing_signs: "Existem, parcialmente apagados. Qtde:",
  no_visible_crossing_signs: "Travessia sem pintura. Qtde:",
  pictograms_along_structure_existence: "17.4 Pictogramas ao longo do trecho",
  good_conditions_picto_signs: "Existem, em boas condições. Qtde:",
  bad_conditions_picto_signs: "Existem, parcialmente apagados. Qtde",
  arrows_along_structure_existence: "17.5 Setas ao longo da estrutura",
  good_conditions_arrow_signs: "Existem, em boas condições. Qtde:",
  bad_conditions_arrow_signs: "Existem, parcialmente apagadas. Qtde:",
  dedicated_ligthing: "Dedicada para ciclistas. Qtde:",
  same_side_ligthing: "Geral na via do mesmo lado da estrutura. Qtde:",
  other_side_ligthing: "Geral na via do outro lado a infraestrutura. Qtde:",
  end_time: "19. HORÁRIO FIM",
  notes_comments: "20. ANOTAÇÕES, OBSERVAÇÕES E COMENTÁRIOS",
  front_page_photo: "Foto página da frente (ficha de avaliação)",
  back_page_photo: "Foto página de trás (ficha de avaliação)",
  structure_photos: "Fotos da estrutura",
  comments: "Comentários",
  length: "comprimento",
};

function get_converted_form(form) {
  const revertedConvertion = reverseConversion(conversion);
  let converted = {};
  for (let key in form) {
    if (revertedConvertion[key])
      converted[revertedConvertion[key]] = form[key].value;
  }

  /*
  on_way_risks_situations_count,
  crossing_risks_situations_count,
  total_unlevel_controls,
  mean_lane_width,
  mean_square_size,
  */

  return converted;
}
module.exports = get_converted_form;
