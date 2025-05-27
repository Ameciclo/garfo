// modules/datasus-deaths/summary.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { datasus_deaths } from "../../db/modules/casualties/table_datasus_deaths";
import { cities } from "../../db/modules/global/table_cities";
import { sql } from "drizzle-orm";
import { config } from "./config";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    // Obtém o ano atual para calcular os últimos 10 anos
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - config.periodos.anosRetroativos;
    
    // Buscar cidades da RMR diretamente da tabela cities
    const rmrCities = await db
      .select({ id: cities.id })
      .from(cities)
      .where(sql`${cities.rmr} = true`)
      .execute();
    
    if (rmrCities.length === 0) {
      return res.status(404).json({ error: "Nenhuma cidade da RMR encontrada" });
    }
    
    // Construir a consulta para cada cidade individualmente
    let whereClause = sql`false`;
    for (const city of rmrCities) {
      whereClause = sql`${whereClause} OR ${datasus_deaths.codmunocor} = ${city.id}`;
    }
    
    // Total de sinistros na RMR nos últimos 10 anos
    const totalRes = await db
      .select({ total: sql<number>`count(*)` })
      .from(datasus_deaths)
      .where(
        sql`(${whereClause}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`
      )
      .execute();
    
    const totalSinistros = Number(totalRes[0].total);

    // Estatísticas por ano
    const yearData = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .where(sql`(${whereClause})`)
      .groupBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();

    // Encontrar o ano mais violento
    const anoMaisViolento = yearData.reduce(
      (max, current) => (Number(current.count) > Number(max.count) ? current : max),
      { year: 0, count: 0 }
    );

    // Calcular crescimento com relação ao ano anterior
    const lastYearData = yearData[yearData.length - 1] || { year: 0, count: 0 };
    const prevYearData = yearData[yearData.length - 2] || { year: 0, count: 0 };
    
    const crescimentoAno = prevYearData.count
      ? ((Number(lastYearData.count) - Number(prevYearData.count)) / Number(prevYearData.count)) * 100
      : 0;

    res.json({
      totalSinistrosUltimos10Anos: totalSinistros,
      totalUltimoAno: Number(lastYearData.count),
      ultimoAno: Number(lastYearData.year),
      crescimentoRelacaoAnoAnterior: crescimentoAno.toFixed(2) + "%",
      anoMaisViolento: {
        ano: Number(anoMaisViolento.year),
        total: Number(anoMaisViolento.count)
      },
      dadosPorAno: yearData.map(item => ({
        ano: Number(item.year),
        total: Number(item.count)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;