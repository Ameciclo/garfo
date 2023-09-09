// Função para salvar informações dos segmentos em formato JSON
function save_segment() {
  let segments = [];

  const forms = getFileAsJson("IDECICLO - forms - public.json");
  const groupedByCityForms = group_by(forms, "city");

  // Itera sobre cada cidade e seus formulários
  Object.keys(groupedByCityForms).forEach((city) => {
    const cityForms = groupedByCityForms[city];
    const groupedByYearForms = group_by(cityForms, "year");

    // Itera sobre os anos revisados
    Object.keys(groupedByYearForms).forEach((year) => {
      let seg;
      const cityYearForms = groupedByYearForms[year];

      // Verifica se a cidade é Recife ou Rio de Janeiro para usar o método apropriado
      if (
        cityYearForms[0].city === "Recife" ||
        cityYearForms[0].city === "Rio de Janeiro"
      ) {
        seg = get_segments(get_city_id(city), parseInt(year));
      } else {
        seg = get_segments_old(
          cityYearForms,
          get_city_id(city),
          parseInt(year)
        );
      }

      // Concatena os segmentos
      segments = segments.concat(seg);
    });
  });

  // Salva as informações dos segmentos em formato JSON
  saveAsJSON(segments, "segments", "public");
}

// Função para obter segmentos usando o método antigo
function get_segments_old(forms, city_id, year) {
  let segments_json = [];
  forms.forEach((f) => {
    let highway = "local";

    // Verifica se há velocidade inapropriada no formulário
    if (f.evaluation.inappropriate_speed) {
      let tipologia = f.characteristics.typology;
      let vel_sup = f.evaluation.inappropriate_speed;

      switch (tipologia) {
        case "Ciclovia":
          highway = "primary";
          break;
        case "Calçada Compartilhada":
          highway = "primary";
          break;
        case "Ciclofaixa":
          highway = "secondary";
          if (vel_sup == "Sim") highway = "primary";
          break;
        case "Ciclorrota":
          highway = "local";
          if (vel_sup == "Sim") highway = "secondary";
          break;
        default:
          highway = "local";
      }
    } else {
      let road_type = f.characteristics.road_type;
      let speed = f.street.regulated_speed;

      switch (speed) {
        case 80:
          highway = "trunk";
          break;
        case 70:
          highway = "trunk";
          break;
        case 60:
          highway = "primary";
          break;
        case 50:
          highway = "primary";
          break;
        case 40:
          highway = "secondary";
          break;
        case 30:
          highway = "local";
          break;
        case 20:
          highway = "local";
          break;
        default:
          highway = "local";
      }

      switch (road_type) {
        case "Transito Rápido":
          highway = "trunk";
          break;
        case "Arterial":
          highway = "primary";
          break;
        case "Coletora":
          highway = "secondary";
          break;
        case "Local":
          highway = "local";
          break;
        default:
      }
    }

    segments_json.push({
      route: f.header.route,
      street: f.header.street,
      district: f.header.district,
      highway: highway,
      typology: f.characteristics.typology,
      form_id: f.id,
      geo_id: null,
      length: f.header.length * 1000,
      id: f.id,
      city_id: city_id,
      year: year,
    });
  });

  return segments_json;
}

// Função para obter segmentos usando o novo método
function get_segments(city, year) {
  const dados = SpreadsheetApp.getActive()
    .getSheetByName("geo_info_table")
    .getDataRange()
    .getValues();
  const cols = get_headers_geo_info_table();
  let segments_json = [];

  for (let i = 1; i < dados.length; i++) {
    const linha = dados[i];
    let col_ids = parseInt(linha[cols.id_form.col]);
    let a = cols.id_form.col;

    if (year === 2016) col_ids = parseInt(linha[cols.id_form.col + 5]);
    if (year === 2018) col_ids = parseInt(linha[cols.id_form.col + 6]);

    if (col_ids > 0) {
      segments_json.push({
        route: linha[cols.rota.col],
        street: linha[cols.logradouro.col],
        district: linha[cols.bairro.col],
        highway: linha[cols.highway.col],
        typology: linha[cols.tipologia.col],
        form_id: city + "-" + year + "-" + parseInt(col_ids),
        geo_id: parseInt(linha[cols.geo_id.col]),
        length: parseFloat(linha[cols.comprimento.col]),
        id: city + "-" + year + "-" + parseInt(linha[cols.geo_id.col]),
        city_id: city,
        year: year,
      });
    }
  }

  return segments_json;
}
