// db/seed/global/seed.ts
import * as schema from "./table_cities";
import { db, readCsv } from "../../utils";
import fs from "fs/promises";
import path from "path";
import { sql } from "drizzle-orm";
import type { FeatureCollection } from "geojson";

type CityCsv = {
  id: string;
  name: string;
  state: string;
  full_state: string;
  rmr: string;
};

export async function seedCities() {
  // 1) Seed text fields from CSV
  const csvPath = path.resolve(__dirname, "cities.csv");
  const rows = await readCsv<CityCsv>(csvPath);

  const cities = rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    state: r.state,
    full_state: r.full_state.trim(),
    rmr: r.rmr.toLowerCase() === "true",
  }));

  await db.insert(schema.cities).values(cities).onConflictDoNothing().execute();
  console.log(`✅ Seeded ${cities.length} cities`);

  // 2) Load and apply geometries from GeoJSON
  const geoJsonPath = path.resolve(__dirname, "geojs-100-mun.json");
  const content = await fs.readFile(geoJsonPath, "utf-8");
  const geo = JSON.parse(content) as FeatureCollection;

  for (const feat of geo.features) {
    const id = Number(feat.properties!.id);
    const geometryJson = JSON.stringify(feat.geometry);

    await db.execute(
      sql`
        UPDATE ${schema.cities}
        SET geom = ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), 4326)
        WHERE id = ${id}
      `
    );
  }

  console.log(`✅ Updated geometries for ${geo.features.length} cities`);
}

// If run directly: `tsx db/seed/global/seed.ts`
if (require.main === module) {
  seedCities().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
