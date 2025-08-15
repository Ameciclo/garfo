import fs from "fs/promises";
import path from "path";
import { sql } from "drizzle-orm";
import { db } from "../../utils"; // mesmo helper que você já usa
import * as schema from "./table_speed_plates";

/* ───────── helpers ───────── */

function extractSpeed(props: any): number | null {
  // Prioriza o campo numérico “speed”
  if (typeof props?.speed === "number") return props.speed;

  // Se não existir, tenta capturar na string “value”
  if (typeof props?.value === "string") {
    const m = props.value.match(/\d{2,3}/);
    if (m) return parseInt(m[0], 10);
  }
  return null;
}

/* ───────── seed ───────── */

export async function seedSpeedPlates() {
  const file = path.resolve(__dirname, "speed_plates.geojson");
  const geojson = JSON.parse(await fs.readFile(file, "utf-8"));

  let inserted = 0;

  for (const feat of geojson.features ?? []) {
    const [lon, lat] = feat.geometry?.coordinates ?? [];
    const speed = extractSpeed(feat.properties);

    if (!lat || !lon || !speed) continue; // pula features incompletos

    await db.execute(sql`
      INSERT INTO ${schema.speed_plates} (speed, geom)
      VALUES (
        ${speed},
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)
      )
      ON CONFLICT DO NOTHING;              -- ignora duplicata exata de geom (se criar unique)
    `);

    inserted++;
  }

  console.log(`✅ ${inserted} placas de velocidade inseridas/atualizadas`);
}

/* ───────── execução direta ───────── */

if (require.main === module) {
  seedSpeedPlates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
