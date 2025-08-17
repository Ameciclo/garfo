import express from "express";
import { db } from "../../db";
import { samu_calls } from "../../db/schema";
import { sql, and, gte, lte } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";

const router = express.Router();

// Evolução mensal e anual
router.get("/", async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    const includeInvalid = parseIncludeInvalid(req.query);

    let whereConditions = and(sql`${samu_calls.data} IS NOT NULL`, getOutcomeFilter(includeInvalid))!;
    
    if (startYear) {
      whereConditions = and(whereConditions, gte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(startYear as string)))!;
    }
    if (endYear) {
      whereConditions = and(whereConditions, lte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(endYear as string)))!;
    }

    // Evolução anual
    const byYear = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(whereConditions)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    // Evolução mensal
    const byMonth = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        mes: sql<number>`EXTRACT(MONTH FROM ${samu_calls.data})`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(whereConditions)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, sql`EXTRACT(MONTH FROM ${samu_calls.data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, sql`EXTRACT(MONTH FROM ${samu_calls.data})`);

    const series = [{
      name: "Total de Chamadas",
      data: byYear.map(item => [item.ano.toString(), item.count])
    }];

    res.json({
      series,
      evolucaoMensal: byMonth,
      filtros: {
        anoInicio: startYear || null,
        anoFim: endYear || null,
        incluir_invalidos: includeInvalid
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/evolution failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;