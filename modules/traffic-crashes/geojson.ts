// src/modules/traffic-crashes/geojson.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import * as schema from "../../db/schemas/traffic_crashes";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        id: schema.crashes.id,
        date: schema.crashes.crash_date,
        vitimas: schema.crashes.vitimas,
        vitimasFat: schema.crashes.vitimas_fat,
        geom: sql<string>`ST_AsGeoJSON(${schema.crashes.geom})`,
      })
      .from(schema.crashes)
      .execute();

    const features = rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: {
        id: row.id,
        date: row.date,
        vitimas: row.vitimas,
        vitimasFat: row.vitimasFat,
      },
    }));

    res.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
