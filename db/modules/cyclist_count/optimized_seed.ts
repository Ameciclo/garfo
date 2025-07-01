import { sql } from "drizzle-orm";
import * as schemaCount from "../../schema";
import { db } from "../../utils";
import { OptimizedSeeder } from "../../optimized-seed";
import path from "path";

interface EditionRaw {
  id: string;
  city_id: string;
  coordinates_id: string;
  name: string;
  date: string;
  latitude: string;
  longitude: string;
}

export async function seedCyclistCountOptimized() {
  const seeder = new OptimizedSeeder();
  
  try {
    // 1. Editions (pequeno, pode ser direto)
    await seeder.seedWithBatching(
      'cyclist_count',
      'editions',
      path.resolve(__dirname, "count_edition.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.cyclist_count_edition)
          .values(batch)
          .onConflictDoNothing();
      },
      (r: EditionRaw) => ({
        id: parseInt(r.id, 10),
        cityId: parseInt(r.city_id, 10),
        name: r.name,
        date: r.date,
        geom: sql`ST_SetSRID(ST_MakePoint(${parseFloat(r.longitude)}, ${parseFloat(r.latitude)}), 4326)`,
      })
    );

    // 2. Sessions
    await seeder.seedWithBatching(
      'cyclist_count',
      'sessions',
      path.resolve(__dirname, "count_session.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.cyclist_count_session)
          .values(batch)
          .onConflictDoNothing();
      },
      (s: any) => ({
        id: parseInt(s.id, 10),
        editionId: parseInt(s.edition_id, 10),
        startTime: new Date(s.start_time),
        endTime: new Date(s.end_time),
      })
    );

    // 3. Directions
    await seeder.seedWithBatching(
      'cyclist_count',
      'directions',
      path.resolve(__dirname, "directions.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.directions)
          .values(batch)
          .onConflictDoNothing();
      },
      (d: any) => ({
        id: parseInt(d.id, 10),
        origin: d.origin,
        originCardinal: d.origin_cardinal,
        destin: d.destin,
        destinCardinal: d.destin_cardinal,
      })
    );

    // 4. Direction Counts (maior volume)
    await seeder.seedWithBatching(
      'cyclist_count',
      'direction_counts',
      path.resolve(__dirname, "direction_count.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.direction_count)
          .values(batch)
          .onConflictDoNothing();
      },
      (d: any) => ({
        id: parseInt(d.id, 10),
        sessionId: parseInt(d.session_id, 10),
        directionId: parseInt(d.direction_id, 10),
        count: parseInt(d.count, 10),
      })
    );

    // 5. Characteristics
    await seeder.seedWithBatching(
      'cyclist_count',
      'characteristics',
      path.resolve(__dirname, "characteristics.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.cyclist_count_characteristics)
          .values(batch)
          .onConflictDoNothing();
      },
      (c: any) => ({
        id: parseInt(c.id, 10),
        name: c.name,
        type: c.type,
        atribute: c.atribute || undefined,
      })
    );

    // 6. Characteristics Counts (maior volume)
    await seeder.seedWithBatching(
      'cyclist_count',
      'characteristics_counts',
      path.resolve(__dirname, "characteristics_count.csv"),
      async (batch: any[]) => {
        await db.insert(schemaCount.cyclist_count_characteristicsCount)
          .values(batch)
          .onConflictDoNothing();
      },
      (c: any) => ({
        id: parseInt(c.id, 10),
        sessionId: parseInt(c.session_id, 10),
        characteristicsId: parseInt(c.characteristics_id, 10),
        count: parseInt(c.count, 10),
      })
    );

    console.log("🎉 Cyclist Count seed otimizado concluído");
    
  } finally {
    await seeder.cleanup();
  }
}