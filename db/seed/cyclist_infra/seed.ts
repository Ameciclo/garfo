import * as schemaInfra from "../../schema";
import { db, readCsv } from "../utils";

type RelationInsert = typeof schemaInfra.cyclist_infra_relations.$inferInsert;
type RelCityInsert =
  typeof schemaInfra.cyclist_infra_relationCities.$inferInsert;
type WayInsert = typeof schemaInfra.cyclist_infra_ways.$inferInsert;

export async function seedCyclistInfra() {
  const rels = await readCsv<RelationInsert>(
    "./db/seed/cyclist-infra/relations.csv"
  );
  await db
    .insert(schemaInfra.cyclist_infra_relations)
    .values(rels)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_relations seeded");

  const relCities = await readCsv<RelCityInsert>(
    "./db/seed/cyclist-infra/relations_cities.csv"
  );
  await db
    .insert(schemaInfra.cyclist_infra_relationCities)
    .values(relCities)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_relationCities seeded");

  const ways = await readCsv<WayInsert>("./db/seed/cyclist-infra/ways.csv");
  await db
    .insert(schemaInfra.cyclist_infra_ways)
    .values(ways)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_ways seeded");
}
