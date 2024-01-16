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

async function seedRelations() {
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

async function seedRelationsCities() {
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

// Função principal para executar todos os seedings
async function runSeed() {
  await seedCities();
  await seedCoordinates();
  await seedRelations();
  await seedRelationsCities();
}

runSeed();
