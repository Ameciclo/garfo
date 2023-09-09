const cities_basics = require('./cities-basics.json');

// Função para salvar informações de cidades em formato JSON
function get_cities_reviews() {
    let cities_reviews = [];

    cities_basics.forEach(city => {
      let reviews = [];
      const years = city.reviewed_at;
  
      years.forEach(year => {
        reviews.push(get_city_review(city.id, year));
      });
  
      cities_reviews.push({
        "id": city.id,
        "name": city.name,
        "state": city.state,
        "population": city.population,
        "ideciclo_original": city.ideciclo_original,
        "reviews": reviews,
      });
    });
  
    // Salva as informações das cidades em formato JSON
    saveAsJSON(cities_reviews, "reviews", "public");
  }
  
  // Função para obter a revisão de uma cidade para um determinado ano
  function get_city_review(city_id, year) {
    const city_network = get_city_network(city_id, year);
    const ideciclo_intermediario = get_ideciclo_intermediario(city_network);
    const weights = get_weights();
  
    return {
      city_id: city_id,
      city: get_city_name(city_id),
      year: year,
      ideciclo: ideciclo_intermediario.road * weights.road + 
                ideciclo_intermediario.street * weights.street + 
                ideciclo_intermediario.local * weights.local,
      ideciclo_intermediario: ideciclo_intermediario,
      city_network: city_network,
    };
  }
  
  // Função para obter a rede de ciclovias de uma cidade para um determinado ano
  function get_city_network(city_id, year) {
    const cycle_structures = get_cycle_structures(city_id, year);
    const cycle_network_length = get_cycling_network_length(city_id, year);
    const cycle_network_rating = get_cycle_network_rating(city_id, year);
  
    return {
      cycle_structures: cycle_structures,
      cycle_rating: cycle_network_rating,
      cycle_length: cycle_network_length,
      road_network: get_road_network(city_id, year),
    };
  }
  
  // Função para obter a contagem de estruturas cicloviárias por tipo
  function get_cycle_structures(city_id, year) {
    const grouped_reviews = get_structures_grouped_by_highway(city_id, year);
  
    return {
      road: grouped_reviews.road.length,
      street: grouped_reviews.street.length,
      local: grouped_reviews.local.length,
    };
  }
  
  // Função para obter o comprimento da rede cicloviária de uma cidade para um determinado ano
  function get_cycling_network_length(city_id, year) {
    const grouped_reviews = get_structures_grouped_by_highway(city_id, year);
  
    return {
      road: grouped_reviews.road.reduce((acc, cur) => acc + cur.reviews.length, 0),
      street: grouped_reviews.street.reduce((acc, cur) => acc + cur.reviews.length, 0),
      local: grouped_reviews.local.reduce((acc, cur) => acc + cur.reviews.length, 0),
    };
  }
  
  // Função para obter a avaliação da rede cicloviária de uma cidade para um determinado ano
  function get_cycle_network_rating(city_id, year) {
    const grouped_reviews = get_structures_grouped_by_highway(city_id, year);
    const rating = {
      road: calculateAverageRating(grouped_reviews.road),
      street: calculateAverageRating(grouped_reviews.street),
      local: calculateAverageRating(grouped_reviews.local),
    };
  
    // Trata casos onde a avaliação é indefinida
    if (!rating.road) rating.road = 0;
    if (!rating.street) rating.street = 0;
    if (!rating.local) rating.local = 0;
  
    return rating;
  }
  
  // Função para calcular a média de avaliação das estruturas cicloviárias
  function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
  
    const totalRating = reviews.reduce(
      (acc, cur) => acc + cur.reviews.length * cur.reviews.rates.average,
      0
    );
    const totalLength = reviews.reduce((acc, cur) => acc + cur.reviews.length, 0);
  
    return totalRating / totalLength || 0;
  }
  
  // Função para calcular os valores intermediários do ideciclo
  function get_ideciclo_intermediario(network) {
    const road = (network.cycle_rating.road / 10) * ((network.cycle_length.road / 1000) / network.road_network.network.road);
    const street = (network.cycle_rating.street / 10) * ((network.cycle_length.street / 1000) / network.road_network.network.street);
    const local = (network.cycle_rating.local / 10) * ((network.cycle_length.local / 1000) / network.road_network.network.local);
  
    return {
      road: road,
      street: street,
      local: local,
    };
  }
  
  // Função para obter estruturas agrupadas por tipo de via
  function get_structures_grouped_by_highway(city_id, year) {
    const structures = getFileAsJson("IDECICLO - structures - public.json");
    const city_structures = structures.filter(s => s.city_id === city_id);
    let selected_structures = [];
  
    city_structures.forEach(cs => {
      let struct = cs;
      let reviews = cs.reviews.filter(r => r.year === year);
  
      if (reviews.length > 0) {
        struct.reviews = reviews[0];
        selected_structures.push(struct);
      }
    });
  
    const grouped_structures = group_by(selected_structures, 'highway');
    let trunk = grouped_structures.trunk || [];
    let primary = grouped_structures.primary || [];
    let secondary = grouped_structures.secondary || [];
    let tertiary = grouped_structures.tertiary || [];
    let local = grouped_structures.local || [];
  
    return {
      road: trunk.concat(primary),
      street: secondary.concat(tertiary),
      local: local,
    };
  }
  
  module.exports = get_cities_reviews