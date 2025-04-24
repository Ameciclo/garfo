import * as schemaCount from "../../schema";
import { db, readCsv } from "../utils";

type EditionInsert = typeof schemaCount.cyclist_count_edition.$inferInsert;
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
  const editions = await readCsv<EditionInsert>(
    "./db/seed/cyclist-count/count_edition.csv"
  );
  await db
    .insert(schemaCount.cyclist_count_edition)
    .values(editions)
    .onConflictDoNothing();
  console.log("✅ cyclist_count_edition seeded");

  const sessionsRaw = await readCsv<SessionRaw>(
    "./db/seed/cyclist-count/count_session.csv"
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
    "./db/seed/cyclist-count/directions.csv"
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
    "./db/seed/cyclist-count/direction_count.csv"
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
    "./db/seed/cyclist-count/characteristics.csv"
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
    "./db/seed/cyclist-count/characteristics_count.csv"
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
