import * as schema from "../../schema";
import { db, readCsv } from "../utils";

type CityInsert = typeof schema.cities.$inferInsert;
type CoordInsert = typeof schema.coordinates.$inferInsert;

export async function seedPublic() {
  // cities
  const cities = await readCsv<CityInsert>("./db/seed/public/cities.csv");
  await db.insert(schema.cities).values(cities).onConflictDoNothing();
  console.log("✅ cities seeded");

  // coordinates
  const coords = await readCsv<CoordInsert>("./db/seed/public/coordinates.csv");
  await db.insert(schema.coordinates).values(coords).onConflictDoNothing();
  console.log("✅ coordinates seeded");
}
