import express from "express";
import { db } from "../../db";
import { samu_calls, pcr_street_names, cities } from "../../db/schema";
import { sql, eq, and, gte, lte, ilike } from "drizzle-orm";

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
      hora_inicio,
      hora_fim,
      motivo_fin_cat,
      motivo_desf_cat,
      limit = "1000"
    } = req.query;

    let whereConditions = sql`1=1`;

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
    if (municipio) {
      whereConditions = and(whereConditions, ilike(samu_calls.municipio, `%${municipio}%`))!;
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
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        por_sexo: sql<any>`json_object_agg(COALESCE(${samu_calls.sexo}, 'Não informado'), count(*))`,
        por_categoria: sql<any>`json_object_agg(COALESCE(${samu_calls.categoria}, 'Não informado'), count(*))`
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .where(whereConditions);

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
        hora_inicio,
        hora_fim,
        motivo_fin_cat,
        motivo_desf_cat
      },
      estatisticas: stats[0],
      dados: results,
      total: results.length
    });
  } catch (error: any) {
    console.error("GET /samu-calls/filters failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;