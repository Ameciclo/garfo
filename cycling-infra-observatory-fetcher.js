//cycling-infra-observatory-fetcher.js
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  sslmode: 'require' // Adicione essa opção
});

async function fetchInfrastructureData() {
  try {
    // Busque as relações da tabela cycling_infra.relations que não têm o campo total_km preenchido
    const query = `
      SELECT id, pdc_ref
      FROM cycling_infra.relations
      WHERE total_km IS NULL
    `;
    const { rows } = await pool.query(query);

    // Para cada relação, faça uma requisição ao OSM para obter as ways
    for (const row of rows) {
      const relationId = row.id;
      const pdcRef = row.pdc_ref;

      // Faça a requisição ao Overpass API para obter as ways relacionadas à infraestrutura
      const overpassQuery = `[out:json];
      (
      relation(${relationId});
      );
      out geom;`;
      const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);

      // Manipule os dados recebidos conforme necessário
      const ways = response.data.elements.filter(element => element.type === 'way');
      const totalKm = calculateTotalKm(ways);

      // Insira os dados das ways no banco de dados na tabela cycling_infra.ways
      await insertWaysData(relationId, ways);

      // Atualize o campo total_km na tabela cycling_infra.relations com o valor calculado
      await updateTotalKm(relationId, totalKm);

      console.log(`Dados atualizados para a relação ${pdcRef}`);
    }

    ('Fetch concluído com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro ao buscar e preencher os dados:', error);
  } finally {
    pool.end(); // Encerre a conexão do pool com o banco de dados
  }
}

// Função auxiliar para calcular o comprimento total das ways
function calculateTotalKm(ways) {
  let totalKm = 0;

  for (const way of ways) {
    if (way.tags && way.tags.length) {
      const length = way.tags.find(tag => tag.key === 'length');

      if (length && length.value) {
        totalKm += parseFloat(length.value);
      }
    }
  }

  return totalKm;
}

// Função auxiliar para inserir os dados das ways no banco de dados
async function insertWaysData(relationId, ways) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const way of ways) {
      const osmId = way.id;
      const name = way.tags ? way.tags.find(tag => tag.key === 'name')?.value : null;
      const length = way.tags ? way.tags.find(tag => tag.key === 'length')?.value : null;
      const highway = way.tags ? way.tags.find(tag => tag.key === 'highway')?.value : null;
      const hasCycleway = way.tags ? way.tags.find(tag => tag.key === 'cycleway') !== undefined : null;
      const cyclewayTypology = way.tags ? way.tags.find(tag => tag.key === 'cycleway:typology')?.value : null;

      const query = `
        INSERT INTO cycling_infra.ways (osm_id, name, length, highway, has_cycleway, cycleway_typology, relation_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (osm_id) DO NOTHING
      `;
      await client.query(query, [osmId, name, length, highway, hasCycleway, cyclewayTypology, relationId]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função auxiliar para atualizar o campo total_km na tabela cycling_infra.relations
async function updateTotalKm(relationId, totalKm) {
  const query = `
    UPDATE cycling_infra.relations
    SET total_km = $1
    WHERE id = $2
  `;
  await pool.query(query, [totalKm, relationId]);
}

// Execute a função para buscar e preencher os dados
fetchInfrastructureData();
