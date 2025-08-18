import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";

const router = express.Router();

// Listar cidades disponíveis nos dados do SAMU
router.get("/", async (req, res) => {
  try {
    const includeInvalid = parseIncludeInvalid(req.query);
    const filter = req.query.filter as string || 'validos';
    
    let whereCondition;
    if (filter === 'invalidos') {
      whereCondition = getOutcomeFilter(true);
    } else if (filter === 'totais') {
      whereCondition = sql`1=1`;
    } else {
      whereCondition = getOutcomeFilter(false);
    }

    const citiesWithData = await db
      .select({
        municipio_samu: samu_calls.municipio,
        count: sql<number>`count(*)::int`,
        id: cities.id,
        name: cities.name,
        rmr: cities.rmr
      })
      .from(samu_calls)
      .leftJoin(cities, eq(samu_calls.city_id, cities.id))
      .where(whereCondition)
      .groupBy(samu_calls.municipio, cities.id, cities.name, cities.rmr)
      .orderBy(sql`count(*) desc`);

    // Buscar histórico por ano para cada cidade
    const citiesWithHistory = await Promise.all(
      citiesWithData.map(async (city) => {
        const yearlyHistory = await db
          .select({
            ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})::int`,
            total_chamados: sql<number>`count(*)::int`
          })
          .from(samu_calls)
          .where(and(
            sql`LOWER(${samu_calls.municipio}) = LOWER(${city.municipio_samu})`,
            whereCondition
          ))
          .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
          .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

        return {
          ...city,
          historico_anual: yearlyHistory
        };
      })
    );

    res.json({
      cidades: citiesWithHistory,
      total: citiesWithHistory.length,
      recife_id: 2611606,
      filtro_aplicado: filter
    });
  } catch (error: any) {
    console.error("GET /samu-calls/cities failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;