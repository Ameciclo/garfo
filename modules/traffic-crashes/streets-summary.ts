// src/modules/traffic-crashes/streets-summary.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import * as crashes from "../../db/schemas/traffic_casualties";
import * as streets from "../../db/schemas/streets";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = express.Router();

/**
 * GET /api/crashes/streets-summary?year=YYYY
 * Retorna lista de vias (prefeitura ou texto bruto) com totais de sinistros e sinistros fatais
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year;
    const year = yearParam ? parseInt(String(yearParam), 10) : null;
    const whereYear = year
      ? sql`date_part('year', ${crashes.crashes.crash_date}) = ${year}`
      : sql`1=1`;

    const rows = await db
      .select({
        streetId: crashes.crashes.street_id,
        name: sql<string>`
          COALESCE(
            ${streets.pref_street_names.nome_logradouro_concatenado},
            ${crashes.crashes.street_name}
          )
        `,
        totalSinistros: sql<number>`COUNT(*)`,
        totalFatais: sql<number>`SUM(${crashes.crashes.vitimas_fat})`,
      })
      .from(crashes.crashes)
      .leftJoin(
        streets.pref_street_names,
        eq(crashes.crashes.street_id, streets.pref_street_names.id)
      )
      .where(whereYear)
      .groupBy(
        crashes.crashes.street_id,
        streets.pref_street_names.nome_logradouro_concatenado,
        crashes.crashes.street_name
      )
      .orderBy(sql`COUNT(*) DESC`)
      .execute();

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
