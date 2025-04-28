// src/modules/traffic-crashes/streets-summary.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import * as crashes from "../../db/schemas/traffic_crashes";
import * as streets from "../../db/schemas/streets";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    // Parse optional year filter
    const yearParam = req.query.year;
    const year = yearParam ? parseInt(String(yearParam), 10) : null;

    // Build WHERE clause dynamically (1=1 for no filter)
    const whereClause = year
      ? sql`date_part('year', ${crashes.crashes.crash_date}) = ${year}`
      : sql`1=1`;

    // Query aggregation per street
    const rows = await db
      .select({
        streetId: crashes.crashes.street_id,
        name: streets.pref_street_names.nome_logradouro_concatenado,
        totalSinistros: sql<number>`count(*)`,
        totalFatais: sql<number>`sum(${crashes.crashes.vitimas_fat})`,
      })
      .from(crashes.crashes)
      .innerJoin(
        streets.pref_street_names,
        eq(crashes.crashes.street_id, streets.pref_street_names.id)
      )
      .where(whereClause)
      .groupBy(
        crashes.crashes.street_id,
        streets.pref_street_names.nome_logradouro_concatenado
      )
      .orderBy(sql`count(*) DESC`)
      .execute();

    // Format response
    const result = rows.map((r) => ({
      streetId: r.streetId,
      name: r.name,
      totalSinistros: Number(r.totalSinistros),
      totalFatais: Number(r.totalFatais),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
