require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

async function fetchInfrastructureData() {
    console.log(process.env.POSTGRES_USER)
  try {
    const query = `
      SELECT id, pdc_ref
      FROM cycling_infra.relations
      WHERE total_km IS NULL
    `;
    const { rows } = await pool.query(query);

    for (const row of rows) {
      const relationId = row.id;
      const pdcRef = row.pdc_ref;

      const overpassQuery = `[out:json][timeout:300][bbox:{{bbox}}];relation(${relationId});out geom;`;
      const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);

      const ways = response.data.elements.filter(element => element.type === 'way');
      const totalKm = calculateTotalKm(ways);

      console.log(`Dados a serem atualizados para a relação ${pdcRef}:`);
      console.log('Ways:');
      console.log(ways);
      console.log('Total Km:', totalKm);
      console.log('----------------------------------------');

      // Uncomment the following lines when you're ready to insert/update the data

      // await insertWaysData(relationId, ways);
      // await updateTotalKm(relationId, totalKm);

      console.log(`Dados atualizados para a relação ${pdcRef}`);
      console.log('========================================');
    }

    console.log('Fetch concluído com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro ao buscar e preencher os dados:', error);
  } finally {
    pool.end();
  }
}

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

      console.log('Inserindo dados da Way:');
      console.log('OSM ID:', osmId);
      console.log('Name:', name);
      console.log('Length:', length);
      console.log('Highway:', highway);
      console.log('Has Cycleway:', hasCycleway);
      console.log('Cycleway Typology:', cyclewayTypology);
      console.log('Relation ID:', relationId);
      console.log('----------------------------------------');

      // Uncomment the following line when you're ready to insert the data

      // const query = `
      //   INSERT INTO cycling_infra.ways (osm_id, name, length, highway, has_cycleway, cycleway_typology, relation_id)
      //   VALUES ($1, $2, $3, $4, $5, $6, $7)
      //   ON CONFLICT (osm_id) DO NOTHING
      // `;
      // await client.query(query, [osmId, name, length, highway, hasCycleway, cyclewayTypology, relationId]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateTotalKm(relationId, totalKm) {
  const query = `
    UPDATE cycling_infra.relations
    SET total_km = $1
    WHERE id = $2
  `;
  await pool.query(query, [totalKm, relationId]);
}

fetchInfrastructureData();
