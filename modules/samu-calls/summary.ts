import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const includeInvalid = parseIncludeInvalid(req.query);
    const outcomeFilter = getOutcomeFilter(includeInvalid);

    // Total de chamadas
    const totalCalls = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls)
      .where(outcomeFilter);

    // Chamadas por categoria
    const byCategory = await db
      .select({
        categoria: samu_calls.categoria,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.categoria} IS NOT NULL`, outcomeFilter))
      .groupBy(samu_calls.categoria)
      .orderBy(sql`count(*) desc`);

    // Chamadas por motivo de finalização
    const byFinalizacao = await db
      .select({
        motivo_fin_cat: samu_calls.motivo_fin_cat,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.motivo_fin_cat} IS NOT NULL`, outcomeFilter))
      .groupBy(samu_calls.motivo_fin_cat)
      .orderBy(sql`count(*) desc`);

    // Chamadas por motivo de desfecho
    const byDesfecho = await db
      .select({
        motivo_desf_cat: samu_calls.motivo_desf_cat,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.motivo_desf_cat} IS NOT NULL`, outcomeFilter))
      .groupBy(samu_calls.motivo_desf_cat)
      .orderBy(sql`count(*) desc`);

    // Chamadas por ano
    const byYear = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.data} IS NOT NULL`, outcomeFilter))
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    res.json({
      totalChamadas: totalCalls[0].count,
      porCategoria: byCategory,
      porMotivoFinalizacao: byFinalizacao,
      porMotivoDesfecho: byDesfecho,
      evolucaoAnual: byYear,
      filtros: {
        incluir_invalidos: includeInvalid
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/summary failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;