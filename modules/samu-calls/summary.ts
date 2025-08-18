import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and, gte, lte, inArray } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";
import { config } from "./config";

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

    // Total de chamadas com desfechos válidos
    const totalValidOutcomes = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls)
      .where(and(
        inArray(samu_calls.motivo_desf_cat, config.desfechos.validos),
        outcomeFilter
      ));

    // Total de chamadas com desfechos inválidos
    const totalInvalidOutcomes = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls)
      .where(and(
        inArray(samu_calls.motivo_desf_cat, config.desfechos.invalidos),
        outcomeFilter
      ));

    // Cidade mais violenta (com mais chamadas válidas)
    const mostViolentCityData = await db
      .select({
        municipio: samu_calls.municipio,
        totalValidas: sql<number>`count(case when ${samu_calls.motivo_desf_cat} in (${sql.join(config.desfechos.validos.map(d => sql`${d}`), sql`, `)}) then 1 end)`,
        totalInvalidas: sql<number>`count(case when ${samu_calls.motivo_desf_cat} in (${sql.join(config.desfechos.invalidos.map(d => sql`${d}`), sql`, `)}) then 1 end)`,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.municipio} IS NOT NULL`, outcomeFilter))
      .groupBy(samu_calls.municipio)
      .orderBy(sql`count(case when ${samu_calls.motivo_desf_cat} in (${sql.join(config.desfechos.validos.map(d => sql`${d}`), sql`, `)}) then 1 end) desc`)
      .limit(1);

    // Evolução anual da cidade mais violenta
    let mostViolentCityEvolution: Array<{
      ano: number;
      totalValidas: number;
      totalInvalidas: number;
      total: number;
    }> = [];
    
    if (mostViolentCityData.length > 0) {
      const cityName = mostViolentCityData[0].municipio;
      if (cityName) {
        mostViolentCityEvolution = await db
          .select({
            ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
            totalValidas: sql<number>`count(case when ${samu_calls.motivo_desf_cat} in (${sql.join(config.desfechos.validos.map(d => sql`${d}`), sql`, `)}) then 1 end)`,
            totalInvalidas: sql<number>`count(case when ${samu_calls.motivo_desf_cat} in (${sql.join(config.desfechos.invalidos.map(d => sql`${d}`), sql`, `)}) then 1 end)`,
            total: sql<number>`count(*)`
          })
          .from(samu_calls)
          .where(and(
            eq(samu_calls.municipio, cityName),
            sql`${samu_calls.data} IS NOT NULL`,
            outcomeFilter
          ))
          .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
          .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);
      }
    }

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
      totalDesfechosValidos: totalValidOutcomes[0].count,
      totalDesfechosInvalidos: totalInvalidOutcomes[0].count,
      cidadeMaisViolenta: mostViolentCityData.length > 0 ? {
        municipio: mostViolentCityData[0].municipio,
        totalValidas: mostViolentCityData[0].totalValidas,
        totalInvalidas: mostViolentCityData[0].totalInvalidas,
        total: mostViolentCityData[0].total,
        evolucaoAnual: mostViolentCityEvolution
      } : null,
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