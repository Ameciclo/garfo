const get_converted_form = require("./conversion");

const first_form = {
  "Carimbo de data/hora": "05/08/2023 07:19:00",
  "Avaliador(a) 1": "Felipe Brust",
  "Avaliador(a) 2": "Tâmara Olivieri ",
  Data: "09/07/2023",
  "Hora Início": "10:20:00",
  Via: "Itapuã",
  "Início do trecho":
    "Avenida Dourival Caymmi - Sentido Casas Bahia para São Cristóvão ",
  "Fim do trecho": "Posto de combustível BR antes de descer para Paralela ",
  "1. TIPO DE ESTRUTURA": "ciclofaixa",
  "2. FLUXO DA ESTRUTURA": "unidirecional, no fluxo dos automóveis",
  "3. FLUXO DA VIA ": "Mão única",
  "4. LOCALIZAÇÃO DA ESTRUTURA": "No bordo direito da via de mão única",
  "Velocidade máxima (km/h)": "50",
  "Faixas de rolamento contíguas à estrutura. Quantidade:": "2",
  "6. TIPO DE SEGREGADORES": "Prismas ou blocos de concreto, Tachas ou tachões",
  "7. PROTEÇÃO CONTRA INVASÃO DE AUTOMÓVEL":
    "Poucos trechos COM segregadores dificultando invasão",
  "8.1 Segregadores": "Segregadores NÃO DIFICULTAM o acesso",
  "Qtde de acessos:": "",
  "Qtde Vias transversais COM acesso:": "",
  "Qtde Vias transversais SEM acesso:": "",
  "": "Não se aplica",
  "9.1 Tipo de pavimento": "Asfalto",
  "9.2 Situação de conservação do pavimento":
    "Buracos grandes que demandam saída a estrutura",
  "10. SINUOSIDADE": "O traçado é sinuoso, exigindo atenção",
  "11. SOMBREAMENTO": "Não há arvores nem mudas",
  "12. SITUAÇÕES DE RISCO (RELATIVAS A AUTOMÓVEIS)":
    "Paradas de ônibus ao longo",
  "Paradas de ônibus ao longo": "5",
  "Cruzamentos com veículos em curva de ângulo aberto e sem tratamento de redução de velocidade":
    "",
  "Trajeto de conversão permite invasão de automóvel de trecho de linha contínua da estrutura":
    "",
  "Troca lado da estrutura sem redutores de velocidade ou semáforos": "",
  "Conversão à esquerda de automóvel com invisibilidade de ciclista": "",
  "Fim repentino de estrutura no contrafluxo": "",
  Outros: "0",
  "Total de situações de risco": "",
  "13. OBSTÁCULOS PERMANENTES (RELATIVOS AO ASFALTO)": "Bueiros",
  Bueiros: "4",
  Raízes: "",
  Buracos: "2",
  "Valas profundas ao longo da estrutura": "",
  Desníveis: "",
  Outros: "",
  "Total de obstáculos": "6",
  "Se valas, largura desta": "",
  "Largura da área transitável da estrutura (metros):": "3,4",
  "Largura da faixa de amortecimento da estrutura (cm):": "0",
  "Largura da faixa de rolamento contígua à estrutura (metros):": "6,8",
  "Largura total da VIA incluindo a estrutura (metros):": "1,55",
  "Estacionamento:": "Estacionamento proibido na via",
  "15. CONTROLE DA VELOCIDADE MÁXIMA DA VIA":
    "Nenhum elemento de controle de velocidade na via",
  "Sinalização VERTICAL. Qtde": "6",
  "Sinalização HORIZONTAL. Qtde": "1",
  "Travessia de pedestre em nível. Qtde": "3",
  "Lombadas físicas. Qtde": "0",
  "Radar/Lombada Eletrônica. Qtde": "0",
  "Outros elementos (nome do elemento e Qtde)": "",
  "16.1 Indicação de início (placa R-34)": "sim",
  "16.2 Indicação de fim (placa R-34)": "não",
  "16.3 Indicação AO LONGO da estrutura (placa R-34). Qtde:": "3",
  "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias COM":
    "1",
  "16.4 Indicação de travessias cicloviárias nas VIAS TRANSVERSAIS Travessias SEM":
    "0",
  "17.1 Padrão de pintura vermelha": "Pintada de vermelho com interrupções",
  "17.2 Situação da pintura vermelha ":
    "A pintura é MUITO falha, mostrando muito asfalto",
  "Existem, em boas condições. Qtde:": "00",
  "Existem, parcialmente apagados. Qtde:": "6",
  "Travessia sem pintura. Qtde:": "0",
  "17.4 Pictogramas ao longo do trecho": "",
  "Existem, em boas condições. Qtde:": "0",
  "Existem, parcialmente apagados. Qtde": "4",
  "17.5 Setas ao longo da estrutura": "Não existem",
  "Existem, em boas condições. Qtde:": "1",
  "Existem, parcialmente apagadas. Qtde: ": "4",
  "Dedicada para ciclistas. Qtde:": "0",
  "Geral na via do mesmo lado da estrutura. Qtde:": "12",
  "Geral na via do outro lado a infraestrutura. Qtde:": "12",
  "19. HORÁRIO FIM": "11:15:00",
  "20. ANOTAÇÕES, OBSERVAÇÕES E COMENTÁRIOS": "",
  "Foto página da frente (ficha de avaliação)": "",
  "Foto página de trás (ficha de avaliação)": "",
  "Fotos da estrutura": "",
  Comentários: "",
  comprimento: "1",
};

function get_forms_data() {
  let forms_data = first_form[conversionKey];
  forms_data[on_way_risks_situations_count] = 0;
  forms_data[crossing_risks_situations_count] = 0;
  forms_data[total_unlevel_controls] = 0;
  return forms_data;
}

module.exports = get_forms_data;
