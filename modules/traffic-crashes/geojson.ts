// src/modules/traffic-crashes/geojson.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";
import { crashes } from "../../db/schemas/traffic_crashes";
import { pref_street_names } from "../../db/schemas/streets";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  console.log("Rodadno GEOJSON")
  try {
    const rows = await db
      .select({
        id: pref_street_names.id,
        nome_oficial: pref_street_names.nome_oficial_logradouro,
        total_colisoes: sql<number>`COUNT(${crashes.id})`,
        total_vitimas: sql<number>`SUM(${crashes.vitimas})`,
        geom: sql<string>`ST_AsGeoJSON(${pref_street_names.geom})`,
      })
      .from(pref_street_names)
      .leftJoin(crashes, sql`${crashes.street_id} = ${pref_street_names.id}`)
      .where(sql`${pref_street_names.geom} IS NOT NULL`)
      .groupBy(pref_street_names.id)
      .execute();

    const features = rows
      .filter((r) => r.geom)
      .map((row) => ({
        type: "Feature",
        geometry: JSON.parse(row.geom),
        properties: {
          id: row.id,
          nome: row.nome_oficial,
          colisoes: Number(row.total_colisoes ?? 0),
          vitimas: Number(row.total_vitimas ?? 0),
        },
      }));

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error("Erro ao gerar GeoJSON:", err);
    res.status(500).json({ error: "Erro interno ao gerar GeoJSON" });
  }
});

export default router;
