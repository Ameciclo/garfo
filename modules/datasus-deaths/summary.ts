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
    
    // Construir a consulta para cada cidade individualmente (local de ocorrência)
    let whereClauseOcor = sql`false`;
    for (const city of rmrCities) {
      whereClauseOcor = sql`${whereClauseOcor} OR ${datasus_deaths.codmunocor} = ${city.id}`;
    }
    
    // Construir a consulta para cada cidade individualmente (local de residência)
    let whereClauseRes = sql`false`;
    for (const city of rmrCities) {
      whereClauseRes = sql`${whereClauseRes} OR ${datasus_deaths.codmunres} = ${city.id}`;
    }
    
    // Total de sinistros na RMR nos últimos 10 anos (por local de ocorrência)
    const totalResOcor = await db
      .select({ total: sql<number>`count(*)` })
      .from(datasus_deaths)
      .where(
        sql`(${whereClauseOcor}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`
      )
      .execute();
    
    const totalSinistrosOcor = Number(totalResOcor[0].total);

    // Total de sinistros na RMR nos últimos 10 anos (por local de residência)
    const totalResRes = await db
      .select({ total: sql<number>`count(*)` })
      .from(datasus_deaths)
      .where(
        sql`(${whereClauseRes}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`
      )
      .execute();
    
    const totalSinistrosRes = Number(totalResRes[0].total);

    // Estatísticas por ano (por local de ocorrência)
    const yearDataOcor = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .where(sql`(${whereClauseOcor}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`)
      .groupBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();

    // Estatísticas por ano (por local de residência)
    const yearDataRes = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .where(sql`(${whereClauseRes}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`)
      .groupBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();

    // Encontrar o ano mais violento nos últimos 10 anos (por local de ocorrência)
    const anoMaisViolentoOcor = yearDataOcor.reduce(
      (max, current) => (Number(current.count) > Number(max.count) ? current : max),
      { year: 0, count: 0 }
    );

    // Encontrar o ano mais violento nos últimos 10 anos (por local de residência)
    const anoMaisViolentoRes = yearDataRes.reduce(
      (max, current) => (Number(current.count) > Number(max.count) ? current : max),
      { year: 0, count: 0 }
    );

    // Calcular crescimento com relação ao ano anterior (por local de ocorrência)
    const lastYearDataOcor = yearDataOcor[yearDataOcor.length - 1] || { year: 0, count: 0 };
    const prevYearDataOcor = yearDataOcor[yearDataOcor.length - 2] || { year: 0, count: 0 };
    
    const crescimentoAnoOcor = prevYearDataOcor.count
      ? ((Number(lastYearDataOcor.count) - Number(prevYearDataOcor.count)) / Number(prevYearDataOcor.count)) * 100
      : 0;

    // Calcular crescimento com relação ao ano anterior (por local de residência)
    const lastYearDataRes = yearDataRes[yearDataRes.length - 1] || { year: 0, count: 0 };
    const prevYearDataRes = yearDataRes[yearDataRes.length - 2] || { year: 0, count: 0 };
    
    const crescimentoAnoRes = prevYearDataRes.count
      ? ((Number(lastYearDataRes.count) - Number(prevYearDataRes.count)) / Number(prevYearDataRes.count)) * 100
      : 0;

    res.json({
      porLocalOcorrencia: {
        totalSinistrosUltimos10Anos: totalSinistrosOcor,
        totalUltimoAno: Number(lastYearDataOcor.count),
        ultimoAno: Number(lastYearDataOcor.year),
        crescimentoRelacaoAnoAnterior: Number(crescimentoAnoOcor.toFixed(2)),
        anoMaisViolento: {
          ano: Number(anoMaisViolentoOcor.year),
          total: Number(anoMaisViolentoOcor.count)
        },
        dadosPorAno: yearDataOcor.map(item => ({
          ano: Number(item.year),
          total: Number(item.count)
        }))
      },
      porLocalResidencia: {
        totalSinistrosUltimos10Anos: totalSinistrosRes,
        totalUltimoAno: Number(lastYearDataRes.count),
        ultimoAno: Number(lastYearDataRes.year),
        crescimentoRelacaoAnoAnterior: Number(crescimentoAnoRes.toFixed(2)),
        anoMaisViolento: {
          ano: Number(anoMaisViolentoRes.year),
          total: Number(anoMaisViolentoRes.count)
        },
        dadosPorAno: yearDataRes.map(item => ({
          ano: Number(item.year),
          total: Number(item.count)
        }))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;