// src/modules/traffic-crashes/streets-summary.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { cttu_crashes } from "../../db/modules/casualties/table_cttu_crashes";
import * as streets from "../../db/modules/global/table_pcr_street_names";
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
      ? sql`date_part('year', ${cttu_crashes.data}) = ${year}`
      : sql`1=1`;

    const rows = await db
      .select({
        streetId: cttu_crashes.street_id,
        name: sql<string>`
          COALESCE(
            ${streets.pcr_street_names.nome_logradouro_concatenado},
            ${cttu_crashes.endereco}
          )
        `,
        totalSinistros: sql<number>`COUNT(*)`,
        totalFatais: sql<number>`SUM(${cttu_crashes.vitimas_fat})`,
      })
      .from(cttu_crashes)
      .leftJoin(
        streets.pcr_street_names,
        eq(cttu_crashes.street_id, streets.pcr_street_names.id)
      )
      .where(whereYear)
      .groupBy(
        cttu_crashes.street_id,
        streets.pcr_street_names.nome_logradouro_concatenado,
        cttu_crashes.endereco
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
