import express from "express";
import { db } from "../../db";
import { samu_calls, pcr_street_names, cities } from "../../db/schema";
import { sql, eq, and, gte, lte, ilike } from "drizzle-orm";
import { getOutcomeFilter, parseIncludeInvalid } from "./utils";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      idade_min,
      idade_max,
      sexo,
      ano_inicio,
      ano_fim,
      categoria,
      subtipo,
      municipio,
      cityId,
      hora_inicio,
      hora_fim,
      motivo_fin_cat,
      motivo_desf_cat,
      limit = "1000"
    } = req.query;

    const includeInvalid = parseIncludeInvalid(req.query);
    let whereConditions = getOutcomeFilter(includeInvalid);

    // Filtros de idade
    if (idade_min) {
      whereConditions = and(whereConditions, gte(samu_calls.idade, parseInt(idade_min as string)))!;
    }
    if (idade_max) {
      whereConditions = and(whereConditions, lte(samu_calls.idade, parseInt(idade_max as string)))!;
    }

    // Filtro de sexo
    if (sexo) {
      whereConditions = and(whereConditions, eq(samu_calls.sexo, sexo as string))!;
    }

    // Filtros de ano
    if (ano_inicio) {
      whereConditions = and(whereConditions, gte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(ano_inicio as string)))!;
    }
    if (ano_fim) {
      whereConditions = and(whereConditions, lte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(ano_fim as string)))!;
    }

    // Filtros de categoria e subtipo
    if (categoria) {
      whereConditions = and(whereConditions, eq(samu_calls.categoria, categoria as string))!;
    }
    if (subtipo) {
      whereConditions = and(whereConditions, eq(samu_calls.subtipo, subtipo as string))!;
    }

    // Filtro de município
    if (cityId) {
      // Buscar nome da cidade pelo ID
      const city = await db
        .select({ name: cities.name })
        .from(cities)
        .where(eq(cities.id, parseInt(cityId as string)))
        .limit(1);
      
      if (city.length > 0) {
        whereConditions = and(whereConditions, sql`LOWER(${samu_calls.municipio}) = LOWER(${city[0].name})`)!;
      }
    } else if (municipio) {
      whereConditions = and(whereConditions, ilike(samu_calls.municipio, `%${municipio}%`))!;
    } else {
      // Se não especificou município, filtra por todos da RMR
      const rmrCities = await db
        .select({ name: cities.name })
        .from(cities)
        .where(sql`${cities.rmr} = true`);
      
      if (rmrCities.length > 0) {
        const cityNames = rmrCities.map(city => city.name);
        let cityClause = sql`false`;
        for (const cityName of cityNames) {
          cityClause = sql`${cityClause} OR LOWER(${samu_calls.municipio}) = LOWER(${cityName})`;
        }
        whereConditions = and(whereConditions, cityClause)!;
      }
    }

    // Filtros de horário
    if (hora_inicio) {
      whereConditions = and(whereConditions, gte(sql`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`, parseInt(hora_inicio as string)))!;
    }
    if (hora_fim) {
      whereConditions = and(whereConditions, lte(sql`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`, parseInt(hora_fim as string)))!;
    }

    // Filtros de motivo
    if (motivo_fin_cat) {
      whereConditions = and(whereConditions, eq(samu_calls.motivo_fin_cat, motivo_fin_cat as string))!;
    }
    if (motivo_desf_cat) {
      whereConditions = and(whereConditions, eq(samu_calls.motivo_desf_cat, motivo_desf_cat as string))!;
    }

    // Buscar dados filtrados
    const results = await db
      .select({
        id: samu_calls.id,
        data: samu_calls.data,
        hora_minuto: samu_calls.hora_minuto,
        municipio: samu_calls.municipio,
        bairro: samu_calls.bairro,
        endereco: samu_calls.endereco,
        nome_oficial_logradouro: pcr_street_names.nome_oficial_logradouro,
        categoria: samu_calls.categoria,
        subtipo: samu_calls.subtipo,
        sexo: samu_calls.sexo,
        idade: samu_calls.idade,
        motivo_fin_cat: samu_calls.motivo_fin_cat,
        motivo_desf_cat: samu_calls.motivo_desf_cat,
        rmr: cities.rmr
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions)
      .orderBy(samu_calls.data)
      .limit(parseInt(limit as string));

    // Estatísticas dos resultados filtrados
    const statsTotal = await db
      .select({
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions);

    const statsSexo = await db
      .select({
        sexo: sql<string>`COALESCE(${samu_calls.sexo}, 'Não informado')`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions)
      .groupBy(sql`COALESCE(${samu_calls.sexo}, 'Não informado')`);

    const statsCategoria = await db
      .select({
        categoria: sql<string>`COALESCE(${samu_calls.categoria}, 'Não informado')`,
        count: sql<number>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions)
      .groupBy(sql`COALESCE(${samu_calls.categoria}, 'Não informado')`);

    // Converter para objeto
    const por_sexo = statsSexo.reduce((acc, item) => {
      acc[item.sexo] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const por_categoria = statsCategoria.reduce((acc, item) => {
      acc[item.categoria] = item.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      filtrosAplicados: {
        idade_min,
        idade_max,
        sexo,
        ano_inicio,
        ano_fim,
        categoria,
        subtipo,
        municipio,
        cityId,
        hora_inicio,
        hora_fim,
        motivo_fin_cat,
        motivo_desf_cat,
        incluir_invalidos: includeInvalid
      },
      estatisticas: {
        total: statsTotal[0]?.total || 0,
        por_sexo,
        por_categoria
      },
      dados: results,
      total: results.length
    });
  } catch (error: any) {
    console.error("GET /samu-calls/filters failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;