import { Pool } from "pg";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import csv from "csv-parser";
import fs from "fs";
import * as schema from "../migration/schema";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

function readCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] | PromiseLike<any[]> = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

type CityInsertType = typeof schema.cities.$inferInsert;
type CoordinateInsertType = typeof schema.coordinates.$inferInsert;
type RelationsInsertType = typeof schema.cyclist_infra_relations.$inferInsert;
type RelationsCitiesInsertType =
  typeof schema.cyclist_infra_relationCities.$inferInsert;
type WaysInsertType = typeof schema.cyclist_infra_ways.$inferInsert;

async function seedCities() {
  const data = await readCsv("./db/seed/public/cities.csv");
  const insertionData: CityInsertType[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    state: item.state,
  }));

  try {
    await db.insert(schema.cities).values(insertionData).onConflictDoNothing();
    console.log("Seeding de cities concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados:", error);
  }
}

async function seedCoordinates() {
  const data = await readCsv("./db/seed/public/coordinates.csv");
  const insertionData: CoordinateInsertType[] = data.map((item) => ({
    id: item.id,
    point: item.point,
    type: item.type,
  }));
  try {
    await db
      .insert(schema.coordinates)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de coordinates concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em coordinates:", error);
  }
}

async function seedCyclistInfraRelations() {
  const data = await readCsv("./db/seed/cyclist-infra/relations.csv");
  const insertionData: RelationsInsertType[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    pdcRef: item.pdc_ref,
    pdcNotes: item.pdc_notes,
    pdcTypology: item.pdc_typology,
    pdcKm: item.pdc_km,
    pdcStretch: item.pdc_stretch,
    pdcCities: item.pdc_cities,
    osmId: item.osm_id || null,
    notes: item.notes,
  }));
  try {
    await db
      .insert(schema.cyclist_infra_relations)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de relations concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em relations:", error);
  }
}

async function seedCyclistInfraRelationsCities() {
  const data = await readCsv("./db/seed/cyclist-infra/relations_cities.csv");
  const insertionData: RelationsCitiesInsertType[] = data.map((item) => ({
    relationId: item.relation_id,
    citiesId: item.cities_id,
  }));
  try {
    await db
      .insert(schema.cyclist_infra_relationCities)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de relations_cities concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em relations_cities:", error);
  }
}

async function seedCyclistInfraWays() {
  const data = await readCsv("./db/seed/cyclist-infra/ways.csv");
  const insertionData: WaysInsertType[] = data.map((item) => ({
    osmId: item.osm_id,
    name: item.name,
    length: item.length,
    highway: item.highway,
    hasCycleway: item.has_cycleway,
    cyclewayTypology: item.cycleway_typology,
    relationId: item.relation_id,
    geojson: item.geojson,
    lastUpdated: null,
    cityId: item.city_id,
    dualCarriageway: item.dual_carriageway,
    pdcTypology: item.pdc_typology,
  }));
  try {
    await db
      .insert(schema.cyclist_infra_ways)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de ways concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em ways:", error);
  }
}

// Função para fazer o seeding da tabela cyclist_count_edition
async function seedCyclistCountEdition() {
  const data = await readCsv("./db/seed/cyclist-count/count_edition.csv");
  const insertionData: (typeof schema.cyclist_count_edition.$inferInsert)[] =
    data.map((item) => ({
      id: item.id,
      cityId: item.city_id,
      name: item.name,
      date: item.date,
      coordinatesId: item.coordinates_id,
    }));

  try {
    await db
      .insert(schema.cyclist_count_edition)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding da tabela cyclist_count_edition concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em cyclist_count_edition:", error);
  }
}

// Função para fazer o seeding da tabela cyclist_count_session
async function seedCyclistCountSession() {
  const data = await readCsv("./db/seed/cyclist-count/count_session.csv");
  const insertionData: (typeof schema.cyclist_count_session.$inferInsert)[] =
    data.map((item) => ({
      id: item.id,
      editionId: item.edition_id,
      startTime: new Date(item.start_time),
      endTime: new Date(item.end_time),
    }));

  try {
    await db
      .insert(schema.cyclist_count_session)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding da tabela cyclist_count_session concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em cyclist_count_session:", error);
  }
}

async function seedCyclistCountDirections() {
  const data = await readCsv("./db/seed/cyclist-count/directions.csv");
  const insertionData = data.map((item) => ({
    id: parseInt(item.id, 10),
    origin: item.origin,
    originCardinal: item.origin_cardinal,
    destin: item.destin,
    destinCardinal: item.destin_cardinal,
  }));

  try {
    await db
      .insert(schema.directions)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de directions concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em directions:", error);
  }
}

async function seedCyclistCountDirectionCounts() {
  const data = await readCsv("./db/seed/cyclist-count/direction_count.csv");
  const insertionData = data.map((item) => ({
    id: parseInt(item.id, 10),
    sessionId: parseInt(item.session_id, 10),
    directionId: parseInt(item.direction_id, 10),
    count: parseInt(item.count, 10),
  }));

  try {
    await db
      .insert(schema.direction_count)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding de direction_count concluído.");
  } catch (error) {
    console.error("Erro ao inserir dados em direction_count:", error);
  }
}

// Função para fazer o seeding da tabela cyclist_count_characteristics
async function seedCyclistCountCharacteristics() {
  const data = await readCsv("./db/seed/cyclist-count/characteristics.csv");
  const insertionData: (typeof schema.cyclist_count_characteristics.$inferInsert)[] =
    data.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      atribute: item.atribute,
    }));

  try {
    await db
      .insert(schema.cyclist_count_characteristics)
      .values(insertionData)
      .onConflictDoNothing();
    console.log("Seeding da tabela cyclist_count_characteristics concluído.");
  } catch (error) {
    console.error(
      "Erro ao inserir dados em cyclist_count_characteristics:",
      error
    );
  }
}

// Função para fazer o seeding da tabela cyclist_count_characteristicsCount
async function seedCyclistCountCharacteristicsCount() {
  const data = await readCsv(
    "./db/seed/cyclist-count/characteristics_count.csv"
  );
  const insertionData: (typeof schema.cyclist_count_characteristicsCount.$inferInsert)[] =
    data.map((item) => ({
      id: item.id,
      sessionId: item.session_id,
      characteristicsId: item.characteristics_id,
      count: item.count,
    }));

  try {
    await db
      .insert(schema.cyclist_count_characteristicsCount)
      .values(insertionData)
      .onConflictDoNothing();
    console.log(
      "Seeding da tabela cyclist_count_characteristicsCount concluído."
    );
  } catch (error) {
    console.error(
      "Erro ao inserir dados em cyclist_count_characteristicsCount:",
      error
    );
  }
}

// Função principal para executar todos os seedings
async function runSeed() {
  // public
  await seedCities();
  await seedCoordinates();

  // Cyclist Infra
  await seedCyclistInfraRelations();
  await seedCyclistInfraRelationsCities();
  await seedCyclistInfraWays();

  // Cyclist Count
  await seedCyclistCountEdition();
  await seedCyclistCountSession();
  await seedCyclistCountDirections();
  await seedCyclistCountDirectionCounts();
  await seedCyclistCountCharacteristics();
  await seedCyclistCountCharacteristicsCount();
}

runSeed();
