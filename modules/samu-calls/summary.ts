import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 9;

    // Total de chamadas
    const totalCalls = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls);

    // Chamadas por categoria
    const byCategory = await db
      .select({
        categoria: samu_calls.categoria,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(sql`${samu_calls.categoria} IS NOT NULL`)
      .groupBy(samu_calls.categoria)
      .orderBy(sql`count(*) desc`);

    // Chamadas por motivo de finalização
    const byFinalizacao = await db
      .select({
        motivo_fin_cat: samu_calls.motivo_fin_cat,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(sql`${samu_calls.motivo_fin_cat} IS NOT NULL`)
      .groupBy(samu_calls.motivo_fin_cat)
      .orderBy(sql`count(*) desc`);

    // Chamadas por motivo de desfecho
    const byDesfecho = await db
      .select({
        motivo_desf_cat: samu_calls.motivo_desf_cat,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(sql`${samu_calls.motivo_desf_cat} IS NOT NULL`)
      .groupBy(samu_calls.motivo_desf_cat)
      .orderBy(sql`count(*) desc`);

    // Chamadas por ano
    const byYear = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(sql`${samu_calls.data} IS NOT NULL`)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    res.json({
      totalChamadas: totalCalls[0].count,
      porCategoria: byCategory,
      porMotivoFinalizacao: byFinalizacao,
      porMotivoDesfecho: byDesfecho,
      evolucaoAnual: byYear
    });
  } catch (error: any) {
    console.error("GET /samu-calls/summary failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;