const forms_conversion = {
  timestamp: { type: "date", salvador2023: "Carimbo de data/hora" },
  evaluator_1: { type: "string", salvador2023: "Avaliador(a) 1" },
  evaluator_2: { type: "string", salvador2023: "Avaliador(a) 2" },
  date: { type: "date", salvador2023: "Data" },
  start_time: { type: "date", salvador2023: "Hora Início" },
  street: { type: "string", salvador2023: "Via" },
  section_start: { type: "string", salvador2023: "Início do trecho" },
  section_end: { type: "string", salvador2023: "Fim do trecho" },
  section_name: { type: "string", salvador2023: "Trecho Avaliado" },
  typology: { type: "string", salvador2023: "1. TIPO DE ESTRUTURA" },
  flow_direction: { type: "string", salvador2023: "2. FLUXO DA ESTRUTURA" },
  traffic_flow: { type: "string", salvador2023: "3. FLUXO DA VIA" },
  localization: { type: "string", salvador2023: "4. LOCALIZAÇÃO DA ESTRUTURA" },
  speed_limit: { type: "int", salvador2023: "Velocidade máxima (km/h)" },
  contiguos_lanes: { type: "int", salvador2023: "Faixas de rolamento contíguas à estrutura. Quantidade:" },
  segregator_type: { type: "string", salvador2023: "6. TIPO DE SEGREGADORES" },
  protection_conditions_evaluation: { type: "string", salvador2023: "7. PROTEÇÃO CONTRA INVASÃO DE AUTOMÓVEL" },
  access_evaluation: { type: "string", salvador2023: "8.1 Segregadores" },
  all_access_count: { type: "int", salvador2023: "Qtde de acessos:" },
  way_with_access: { type: "int", salvador2023: "Qtde Vias transversais COM acesso:" },
  ways_without_access: { type: "int", salvador2023: "Qtde Vias transversais SEM acesso:" },
  ways_access_apply: { type: "string", salvador2023: "Quantidade de acessos aplicabilidade:" },
  pavement_type: { type: "string", salvador2023: "9.1 Tipo de pavimento" },
  pavement_condition_evaluation: { type: "string", salvador2023: "9.2 Situação de conservação do pavimento" },
  sinuosity_evaluation: { type: "string", salvador2023: "10. SINUOSIDADE" },
  shading_evaluation: { type: "string", salvador2023: "11. SOMBREAMENTO" },
  car_risk_situations: { type: "string", salvador2023: "12. SITUAÇÕES DE RISCO (RELATIVAS A AUTOMÓVEIS)" },
  bus_stops_along: { type: "int", salvador2023: "Paradas de ônibus ao longo" },
  crossings_no_speed_reduction: { type: "int", salvador2023: "Cruzamentos com veículos em curva de ângulo aberto e sem tratamento de redução de velocidade" },
  conversion_path_allows_car_intrusion: { type: "int", salvador2023: "Trajeto de conversão permite invasão de automóvel de trecho de linha contínua da estrutura" },
  structure_side_change_without_speed_reducers_or_lights: { type: "int", salvador2023: "Troca lado da estrutura sem redutores de velocidade ou semáforos" },
  car_turning_left_with_cyclist_invisibility: { type: "int", salvador2023: "Conversão à esquerda de automóvel com invisibilidade de ciclista" },
  structure_abrupt_end_in_counterflow: { type: "int", salvador2023: "Fim repentino de estrutura no contrafluxo" },
  other_car_risk_situations: { type: "int", salvador2023: "Outras situações de risco" },
  all_risks_situations_count: { type: "int", salvador2023: "Total de situações de risco" },
  permanent_obstacles_asphalt_related: { type: "string", salvador2023: "13. OBSTÁCULOS PERMANENTES (RELATIVOS AO ASFALTO)" },
  manhole_covers: { type: "int", salvador2023: "Bueiros" },
  roots: { type: "int", salvador2023: "Raízes" },
  potholes: { type: "int", salvador2023: "Buracos" },
  deep_gutters_along_structure: { type: "int", salvador2023: "Valas profundas ao longo da estrutura" },
  unevenness_obstacles: { type: "int", salvador2023: "Desníveis" },
  other_obstacles: { type: "int", salvador2023: "Outros obstáculos" },
  all_obstacles_count: { type: "int", salvador2023: "Total de obstáculos" },
  if_gutters_width: { type: "float", salvador2023: "Se valas, largura desta" },
  ridable_width: { type: "float", salvador2023: "Largura da área transitável da estrutura (metros):" },
  buffer_width: { type: "float", salvador2023: "Largura da faixa de amortecimento da estrutura (cm):" },
  side_lane_width: { type: "float", salvador2023: "Largura da faixa de rolamento contígua à estrutura (metros):" },
  road_width: { type: "float", salvador2023: "Largura total da VIA incluindo a estrutura (metros):" },
  parking: { type: "string", salvador2023: "Estacionamento:" },
  max_speed_control: { type: "string", salvador2023: "15. CONTROLE DA VELOCIDADE MÁXIMA DA VIA" },
  vertical_speed_signs_count: { type: "int", salvador2023: "Sinalização VERTICAL. Qtde" },
  horizontal_speed_sign_count: { type: "int", salvador2023: "Sinalização HORIZONTAL. Qtde" },
  pedestrian_crossings_count: { type: "int", salvador2023: "Travessia de pedestre em nível. Qtde" },
  speed_bumps_count: { type: "int", salvador2023: "Lombadas físicas. Qtde" },
  electronic_speed_control_count: { type: "int", salvador2023: "Radar/Lombada Eletrônica. Qtde" },
  other_control_elements_count: { type: "int", salvador2023: "Outros elementos (nome do elemento e Qtde)" },
  start_indication: { type: "string", salvador2023: "16.1 Indicação de início (placa R-34)" },
  end_indication: { type: "string", salvador2023: "16.2 Indicação de fim (placa R-34)" },
  on_way_vertical_signs_count: { type: "int", salvador2023: "16.3 Indicação AO LONGO da estrutura (placa R-34). Qtde:" },
  crosses_with_vertical_sign_count: { type: "int", salvador2023: "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias COM" },
  crosses_without_vertical_sign_count: { type: "int", salvador2023: "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias SEM" },
  horizontal_pattern_evaluation: { type: "string", salvador2023: "17.1 Padrão de pintura vermelha" },
  painting_condition_evaluation: { type: "string", salvador2023: "17.2 Situação da pintura vermelha" },
  good_conditions_crossing_signs: { type: "int", salvador2023: "CRUZAMENTOS Existem, em boas condições. Qtde:" },
  bad_conditions_crossing_signs: { type: "int", salvador2023: "CRUZAMENTOS Existem, parcialmente apagados. Qtde:" },
  no_visible_crossing_signs: { type: "int", salvador2023: "CRUZAMENTOS Travessia sem pintura. Qtde:" },
  pictograms_along_structure_existence: { type: "string", salvador2023: "17.4 Pictogramas ao longo do trecho" },
  good_conditions_picto_signs: { type: "int", salvador2023: "Pictogramas Existem, em boas condições. Qtde:" },
  bad_conditions_picto_signs: { type: "int", salvador2023: "Pictogramas Existem, parcialmente apagados. Qtde:" },
  arrows_along_structure_existence: { type: "string", salvador2023: "17.5 Setas ao longo da estrutura" },
  good_conditions_arrow_signs: { type: "int", salvador2023: "Setas Existem, em boas condições. Qtde:" },
  bad_conditions_arrow_signs: { type: "int", salvador2023: "Setas Existem, parcialmente apagadas. Qtde:" },
  dedicated_ligthing: { type: "int", salvador2023: "Dedicada para ciclistas. Qtde:" },
  same_side_ligthing: { type: "int", salvador2023: "Geral na via do mesmo lado da estrutura. Qtde:" },
  other_side_ligthing: { type: "int", salvador2023: "Geral na via do outro lado a infraestrutura. Qtde:" },
  end_time: { type: "date", salvador2023: "19. HORÁRIO FIM" },
  notes_comments: { type: "string", salvador2023: "20. ANOTAÇÕES, OBSERVAÇÕES E COMENTÁRIOS" },
  front_page_photo: { type: "string", salvador2023: "Foto página da frente (ficha de avaliação)" },
  back_page_photo: { type: "string", salvador2023: "Foto página de trás (ficha de avaliação)" },
  structure_photos: { type: "string", salvador2023: "Fotos da estrutura" },
  comments: { type: "string", salvador2023: "Comentários" },
  length: { type: "float", salvador2023: "length_google_maps" },
  geo_id: { type: "int", salvador2023: "geo_id" },
  form_id: { type: "int", salvador2023: "form_id" },
};

module.exports = forms_conversion;
