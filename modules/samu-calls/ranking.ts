import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";

const router = express.Router();

// Ranking de dias da semana e meses
router.get("/temporal", async (req, res) => {
  try {
    const includeInvalid = parseIncludeInvalid(req.query);
    const outcomeFilter = getOutcomeFilter(includeInvalid);

    // Ranking por dia da semana
    const byWeekday = await db
      .select({
        dia_semana: sql<number>`EXTRACT(DOW FROM ${samu_calls.data})`,
        nome_dia: sql<string>`
          CASE EXTRACT(DOW FROM ${samu_calls.data})
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Segunda-feira'
            WHEN 2 THEN 'Terça-feira'
            WHEN 3 THEN 'Quarta-feira'
            WHEN 4 THEN 'Quinta-feira'
            WHEN 5 THEN 'Sexta-feira'
            WHEN 6 THEN 'Sábado'
          END
        `,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.data} IS NOT NULL`, outcomeFilter))
      .groupBy(sql`EXTRACT(DOW FROM ${samu_calls.data})`)
      .orderBy(sql`count(*) desc`);

    // Ranking por mês
    const byMonth = await db
      .select({
        mes: sql<number>`EXTRACT(MONTH FROM ${samu_calls.data})`,
        nome_mes: sql<string>`
          CASE EXTRACT(MONTH FROM ${samu_calls.data})
            WHEN 1 THEN 'Janeiro'
            WHEN 2 THEN 'Fevereiro'
            WHEN 3 THEN 'Março'
            WHEN 4 THEN 'Abril'
            WHEN 5 THEN 'Maio'
            WHEN 6 THEN 'Junho'
            WHEN 7 THEN 'Julho'
            WHEN 8 THEN 'Agosto'
            WHEN 9 THEN 'Setembro'
            WHEN 10 THEN 'Outubro'
            WHEN 11 THEN 'Novembro'
            WHEN 12 THEN 'Dezembro'
          END
        `,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.data} IS NOT NULL`, outcomeFilter))
      .groupBy(sql`EXTRACT(MONTH FROM ${samu_calls.data})`)
      .orderBy(sql`count(*) desc`);

    // Ranking por horário
    const byHour = await db
      .select({
        hora: sql<number>`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(sql`${samu_calls.hora_minuto} IS NOT NULL`, outcomeFilter))
      .groupBy(sql`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`);

    res.json({
      rankingDiasSemana: byWeekday,
      rankingMeses: byMonth,
      distribuicaoHoraria: byHour,
      filtros: {
        incluir_invalidos: includeInvalid
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/ranking/temporal failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Ranking por cidade
router.get("/cities", async (req, res) => {
  try {
    const { year } = req.query;
    const includeInvalid = parseIncludeInvalid(req.query);

    let whereConditions = and(sql`${samu_calls.municipio} IS NOT NULL`, getOutcomeFilter(includeInvalid))!;
    
    if (year) {
      whereConditions = and(whereConditions, sql`EXTRACT(YEAR FROM ${samu_calls.data}) = ${parseInt(year as string)}`)!;
    }

    const byCities = await db
      .select({
        municipio: samu_calls.municipio,
        count: sql<number>`count(*)`,
        rmr: sql<boolean>`MAX(${cities.rmr})`,
        id: sql<number>`MAX(${cities.id})`,
        nome_oficial: sql<string>`MAX(${cities.name})`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions)
      .groupBy(samu_calls.municipio)
      .orderBy(sql`count(*) desc`);

    // Agrupar por classificação RMR
    const byRMR = await db
      .select({
        rmr: cities.rmr,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(and(whereConditions, sql`${cities.rmr} IS NOT NULL`))
      .groupBy(cities.rmr)
      .orderBy(sql`count(*) desc`);

    res.json({
      rankingCidades: byCities,
      porRMR: byRMR,
      filtros: {
        ano: year || null,
        incluir_invalidos: includeInvalid
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/ranking/cities failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;