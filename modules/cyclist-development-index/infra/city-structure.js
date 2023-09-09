const segments = require("./city-segments.json")

// Função para salvar informações das estruturas em formato JSON
function save_structures() {
  let structures = [];
  const groupedCitySegments = groupSegmentsByCity(segments);

  // Itera sobre cada cidade e obtém suas estruturas
  Object.keys(groupedCitySegments).forEach((city_id) => {
    const citySegments = groupedCitySegments[city_id];
    const cityStructures = getStructures(citySegments, parseInt(city_id));
    structures = structures.concat(cityStructures);
  });

  // Salva as informações das estruturas em formato JSON
  saveAsJSON(structures, "structures", "public");
}

// Função para obter as estruturas das cidades
function getStructures(segments, city_id) {
  const rates = getFileAsJson("IDECICLO - rates - public.json");
  let structures = [];

  // Agrupa os segmentos por rua
  const streets = groupSegmentsByProperty(segments, "street");

  // Itera sobre as ruas
  Object.keys(streets).forEach((s) => {
    const street = streets[s];

    // Agrupa os segmentos por rodovia
    const highways = groupSegmentsByProperty(street, "highway");

    // Itera sobre as rodovias
    Object.keys(highways).forEach((h) => {
      const highway = highways[h];

      // Agrupa os segmentos por tipologia
      const struct_type = groupSegmentsByProperty(highway, "typology");

      // Itera sobre as tipologias
      Object.keys(struct_type).forEach((st) => {
        const str_type = struct_type[st];
        let reviews = [];

        // Agrupa os segmentos revisados por ano
        const reviewed_year = groupSegmentsByProperty(str_type, "year");

        // Itera sobre os anos revisados
        Object.keys(reviewed_year).forEach((y) => {
          const st_year = reviewed_year[y];
          let segments = [];
          let seg_rates = [];

          // Itera sobre os segmentos revisados no ano
          st_year.forEach((t) => {
            const r = rates.find((rate) => rate.id === t.form_id);
            segments.push({
              id: t.id,
              form_id: t.form_id,
              geo_id: t.geo_id,
              rates: r,
              length: t.length,
            });
            seg_rates.push(r);
          });

          // Calcula o comprimento total dos segmentos
          const totalLength = segments.reduce(
            (acc, cur) => acc + cur.length,
            0
          );

          let r_average = {
            id: string_to_slug(
              "" +
                get_city_name(city_id) +
                "-" +
                s +
                "-" +
                h +
                "-" +
                st +
                "-" +
                y
            ),
          };

          // Calcula a média das taxas para cada categoria
          Object.keys(seg_rates[0]).forEach((rate) => {
            if (rate !== "id") {
              r_average[rate] =
                segments.reduce((acc, cur) => {
                  if (cur.rates[rate] >= 0) {
                    return acc + cur.rates[rate] * cur.length;
                  }
                }, 0) / totalLength;
            }
          });

          // Cria a revisão para o ano
          reviews.push({
            city_id: city_id,
            year: parseInt(y),
            rates: r_average,
            length: totalLength,
            segments: segments,
          });
        });

        // Cria a estrutura
        structures.push({
          id: string_to_slug("" + get_city_name(city_id) + "-" + s + "-" + st),
          city_id: city_id,
          route: str_type[0].route,
          street: s,
          highway: h,
          tipologia: st,
          typology: st,
          reviews: reviews,
        });
      });
    });
  });
  return structures;
}
