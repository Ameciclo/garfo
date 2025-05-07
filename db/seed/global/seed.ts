import * as schema from "../../schemas/global";
import { db, readCsv } from "../utils";

type CityInsert = typeof schema.cities.$inferInsert;

export async function seedGlobal() {
  // cities
  const cities = await readCsv<CityInsert>("./db/seed/global/cities.csv");
  await db.insert(schema.cities).values(cities).onConflictDoNothing();
  console.log("✅ cities seeded");

}
