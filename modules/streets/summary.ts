import express from "express";
import { db } from "../../db";
import { samu_calls } from "../../db/schema";
import { sql, and, isNotNull } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Total de sinistros
    const totalSinistros = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls)
      .where(isNotNull(samu_calls.endereco));

    // Total de vias únicas
    const totalVias = await db
      .select({ count: sql<number>`count(distinct ${samu_calls.endereco})` })
      .from(samu_calls)
      .where(isNotNull(samu_calls.endereco));

    // Período dos dados
    const periodo = await db
      .select({
        inicio: sql<string>`extract(year from min(${samu_calls.data}))`,
        fim: sql<string>`extract(year from max(${samu_calls.data}))`,
        ultimoMes: sql<string>`to_char(max(${samu_calls.data}), 'YYYY.MM')`
      })
      .from(samu_calls)
      .where(isNotNull(samu_calls.data));

    // Ano mais perigoso
    const anoMaisPerigoso = await db
      .select({
        ano: sql<string>`extract(year from ${samu_calls.data})`,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(isNotNull(samu_calls.data))
      .groupBy(sql`extract(year from ${samu_calls.data})`)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Via mais perigosa
    const viaMaisPerigosa = await db
      .select({
        nome: samu_calls.endereco,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(isNotNull(samu_calls.endereco))
      .groupBy(samu_calls.endereco)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Calcular percentual da via mais perigosa
    let viaMaisPerigosaData = null;
    if (viaMaisPerigosa.length > 0 && totalSinistros.length > 0) {
      const percentual = (viaMaisPerigosa[0].total / totalSinistros[0].count) * 100;
      viaMaisPerigosaData = {
        nome: viaMaisPerigosa[0].nome,
        id: 1, // ID fictício, pois não temos um ID específico para a via
        total: viaMaisPerigosa[0].total,
        percentual: Math.round(percentual * 100) / 100,
        extensao: 2321 // Valor fictício para extensão
      };
    }

    res.json({
      totalSinistros: totalSinistros[0]?.count || 0,
      totalVias: totalVias[0]?.count || 0,
      periodoInicio: periodo[0]?.inicio || "N/A",
      periodoFim: periodo[0]?.fim || "N/A",
      mesUltimoDado: periodo[0]?.ultimoMes || "N/A",
      anoMaisPerigoso: anoMaisPerigoso.length > 0 ? {
        ano: anoMaisPerigoso[0].ano,
        total: anoMaisPerigoso[0].total
      } : null,
      viaMaisPerigosa: viaMaisPerigosaData
    });
  } catch (error: any) {
    console.error("GET /streets/summary failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;