import { sql } from "drizzle-orm";
import * as schemaCount from "../../schema";
import { db, readCsv } from "../../utils";
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
type SessionRaw = Record<string, any>;
interface DirInsertRaw {
  id: string;
  origin: string;
  origin_cardinal: string;
  destin: string;
  destin_cardinal: string;
}
interface DirCountRaw {
  id: string;
  session_id: string;
  direction_id: string;
  count: string;
}
interface CharRaw {
  id: string;
  name: string;
  type: string;
  atribute: string;
}
interface CharCountRaw {
  id: string;
  session_id: string;
  characteristics_id: string;
  count: string;
}

export async function seedCyclistCount() {
  const rawEditions = await readCsv<EditionRaw>(
    path.resolve(__dirname, "count_edition.csv")
  );
  const editions = rawEditions.map((r) => ({
    id: parseInt(r.id, 10),
    cityId: parseInt(r.city_id, 10),
    name: r.name,
    date: r.date, // string YYYY-MM-DD funciona no Drizzle
    // injeta o SQL para montar o Point PostGIS
    geom: sql`ST_SetSRID(
      ST_MakePoint(${parseFloat(r.longitude)}, ${parseFloat(r.latitude)}),
      4326
    )`,
  }));
  await db
    .insert(schemaCount.cyclist_count_edition)
    .values(editions as any) // Drizzle aceita SQL literal aqui
    .onConflictDoNothing();

  console.log("✅ cyclist_count_edition seeded");

  const sessionsRaw = await readCsv<SessionRaw>(
    path.resolve(__dirname, "count_session.csv")
  );
  const sessions = sessionsRaw.map((s) => ({
    id: parseInt(s.id, 10),
    editionId: parseInt(s.edition_id, 10),
    startTime: new Date(s.start_time),
    endTime: new Date(s.end_time),
  }));
  await db
    .insert(schemaCount.cyclist_count_session)
    .values(sessions)
    .onConflictDoNothing();
  console.log("✅ cyclist_count_session seeded");

  const dirsRaw = await readCsv<DirInsertRaw>(
    path.resolve(__dirname, "directions.csv")
  );
  const dirs = dirsRaw.map((d) => ({
    id: parseInt(d.id, 10),
    origin: d.origin,
    originCardinal: d.origin_cardinal,
    destin: d.destin,
    destinCardinal: d.destin_cardinal,
  }));
  await db.insert(schemaCount.directions).values(dirs).onConflictDoNothing();
  console.log("✅ directions seeded");

  const dirCountsRaw = await readCsv<DirCountRaw>(
    path.resolve(__dirname, "direction_count.csv")
  );
  const dirCounts = dirCountsRaw.map((d) => ({
    id: parseInt(d.id, 10),
    sessionId: parseInt(d.session_id, 10),
    directionId: parseInt(d.direction_id, 10),
    count: parseInt(d.count, 10),
  }));
  await db
    .insert(schemaCount.direction_count)
    .values(dirCounts)
    .onConflictDoNothing();
  console.log("✅ direction_count seeded");

  // characteristics and counts
  const charsRaw = await readCsv<CharRaw>(
    path.resolve(__dirname, "characteristics.csv")
  );
  const chars = charsRaw.map((c) => ({
    id: parseInt(c.id, 10),
    name: c.name,
    type: c.type,
    atribute: c.atribute || undefined,
  }));
  await db
    .insert(schemaCount.cyclist_count_characteristics)
    .values(chars)
    .onConflictDoNothing();
  console.log("✅ characteristics seeded");

  const charCountsRaw = await readCsv<CharCountRaw>(
    path.resolve(__dirname, "characteristics_count.csv")
  );
  const charCounts = charCountsRaw.map((c) => ({
    id: parseInt(c.id, 10),
    sessionId: parseInt(c.session_id, 10),
    characteristicsId: parseInt(c.characteristics_id, 10),
    count: parseInt(c.count, 10),
  }));
  await db
    .insert(schemaCount.cyclist_count_characteristicsCount)
    .values(charCounts)
    .onConflictDoNothing();
  console.log("✅ characteristics_count seeded");
}
