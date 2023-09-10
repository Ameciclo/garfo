const cities_basics = require("./cities-basics.json");
const { groupStructuresByRoadType, groupSegLengthByRoadTypeAll } = require("./city-structure");
const { get_weights, get_city_name, get_road_network } = require("./utils");

// Função para retornar os ideciclos
function get_cities_reviews() {
  return cities_basics.map((city) => {
    const reviews = city.reviewed_at.map((year) => {
      return get_city_review(city.id, year);
    });

    return {
      id: city.id,
      name: city.name,
      state: city.state,
      population: city.population,
      reviews: reviews,
    };
  });
}

// Função para obter a revisão de uma cidade para um determinado ano
function get_city_review(city_id, year) {
  const city_network = get_city_network(city_id, year);
  const network_review = get_newtwork_review(city_network);
  const weights = get_weights();

  return {
    city_id: city_id,
    city: get_city_name(city_id),
    year: year,
    ideciclo:
      network_review.road * weights.road +
      network_review.street * weights.street +
      network_review.local * weights.local,
    networks_reviews: network_review,
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
  const grouped_reviews = groupStructuresByRoadType();
  return {
    road: grouped_reviews.road.length,
    street: grouped_reviews.street.length,
    local: grouped_reviews.local.length,
  };
}

// Função para obter o comprimento da rede cicloviária de uma cidade para um determinado ano
function get_cycling_network_length(city_id, year) {
  const grouped_reviews = groupSegLengthByRoadTypeAll();

  return {
    road: grouped_reviews.road.reduce(
      (acc, cur) => acc + cur,
      0
    ),
    street: grouped_reviews.street.reduce(
      (acc, cur) => acc + cur,
      0
    ),
    local: grouped_reviews.local.reduce(
      (acc, cur) => acc + cur,
      0
    ),
  };
}

// Função para obter a avaliação da rede cicloviária de uma cidade para um determinado ano
function get_cycle_network_rating(city_id, year) {
  const grouped_reviews = groupStructuresByRoadType();
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
    (acc, cur) => acc + cur.seg_length * cur.rates.average,
    0
  );
  const totalLength = reviews.reduce((acc, cur) => acc + cur.seg_length, 0);
  return totalRating / totalLength || 0;
}

// Função para calcular os valores intermediários do ideciclo
function get_newtwork_review(network) {
  const road =
    (network.cycle_rating.road / 10) *
    (network.cycle_length.road / network.road_network.network.road);
  const street =
    (network.cycle_rating.street / 10) *
    (network.cycle_length.street / network.road_network.network.street);
  const local =
    (network.cycle_rating.local / 10) *
    (network.cycle_length.local / network.road_network.network.local);

  return {
    road: road,
    street: street,
    local: local,
  };
}

module.exports = get_cities_reviews;
