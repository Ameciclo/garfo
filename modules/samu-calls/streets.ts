import express from "express";
import { db } from "../../db";
import { samu_calls, pcr_street_names, cities } from "../../db/schema";
import { sql, eq, ilike, and, gte, lte, inArray, notInArray, isNotNull } from "drizzle-orm";
import { config } from "./config";

const RECIFE_CITY_ID = 2611606;

const router = express.Router();

// Resumo geral de vias
router.get("/summary", async (req, res) => {
  try {
    const { cityId = RECIFE_CITY_ID, desfechos = "validos" } = req.query;
    const cityIdNum = parseInt(cityId as string);
    
    // Filtro de desfechos
    let desfechoFilter;
    if (desfechos === "validos") {
      desfechoFilter = inArray(samu_calls.motivo_desf_cat, config.desfechos.validos);
    } else if (desfechos === "invalidos") {
      desfechoFilter = inArray(samu_calls.motivo_desf_cat, config.desfechos.invalidos);
    } else {
      desfechoFilter = sql`1=1`; // todos
    }
    
    // Total de sinistros
    const totalSinistros = await db
      .select({ count: sql<number>`count(*)` })
      .from(samu_calls)
      .where(and(
        isNotNull(samu_calls.endereco),
        eq(samu_calls.city_id, cityIdNum),
        desfechoFilter
      ));

    // Total de vias únicas
    const totalVias = await db
      .select({ count: sql<number>`count(distinct ${samu_calls.street_id})` })
      .from(samu_calls)
      .where(and(
        isNotNull(samu_calls.street_id),
        eq(samu_calls.city_id, cityIdNum),
        desfechoFilter
      ));

    // Período dos dados
    const periodo = await db
      .select({
        inicio: sql<string>`extract(year from min(${samu_calls.data}))`,
        fim: sql<string>`extract(year from max(${samu_calls.data}))`,
        ultimoMes: sql<string>`to_char(max(${samu_calls.data}), 'YYYY.MM')`
      })
      .from(samu_calls)
      .where(and(
        isNotNull(samu_calls.data),
        eq(samu_calls.city_id, cityIdNum),
        desfechoFilter
      ));

    // Ano mais perigoso
    const anoMaisPerigoso = await db
      .select({
        ano: sql<string>`extract(year from ${samu_calls.data})`,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(
        isNotNull(samu_calls.data),
        eq(samu_calls.city_id, cityIdNum),
        desfechoFilter
      ))
      .groupBy(sql`extract(year from ${samu_calls.data})`)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Extensão total das vias
    const extensaoVias = await db
      .select({
        total_vias: sql<number>`count(*)`,
        extensao_total_km: sql<number>`sum(ST_Length(ST_Transform(${pcr_street_names.geom}, 3857)) / 1000)`,
        extensao_media_km: sql<number>`avg(ST_Length(ST_Transform(${pcr_street_names.geom}, 3857)) / 1000)`
      })
      .from(pcr_street_names)
      .where(sql`${pcr_street_names.geom} IS NOT NULL`);

    // Via mais perigosa
    const viaMaisPerigosa = await db
      .select({
        nome: pcr_street_names.nome_oficial_logradouro,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .innerJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(and(
        isNotNull(samu_calls.street_id),
        eq(samu_calls.city_id, cityIdNum),
        desfechoFilter
      ))
      .groupBy(samu_calls.street_id, pcr_street_names.nome_oficial_logradouro)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Calcular percentual da via mais perigosa
    let viaMaisPerigosaData = null;
    if (viaMaisPerigosa.length > 0 && totalSinistros.length > 0) {
      const percentual = (viaMaisPerigosa[0].total / totalSinistros[0].count) * 100;
      viaMaisPerigosaData = {
        nome: viaMaisPerigosa[0].nome,
        id: 1,
        total: viaMaisPerigosa[0].total,
        percentual: Math.round(percentual * 100) / 100,
        extensao: 2321
      };
    }

    res.json({
      totalSinistros: Number(totalSinistros[0]?.count || 0),
      totalVias: Number(totalVias[0]?.count || 0),
      extensaoTotalKm: Math.round(Number(extensaoVias[0]?.extensao_total_km || 0) * 100) / 100,
      extensaoMediaKm: Math.round(Number(extensaoVias[0]?.extensao_media_km || 0) * 100) / 100,
      periodoInicio: periodo[0]?.inicio || "N/A",
      periodoFim: periodo[0]?.fim || "N/A",
      mesUltimoDado: periodo[0]?.ultimoMes || "N/A",
      anoMaisPerigoso: anoMaisPerigoso.length > 0 ? {
        ano: anoMaisPerigoso[0].ano,
        total: anoMaisPerigoso[0].total
      } : null,
      viaMaisPerigosa: viaMaisPerigosaData,
      filtros: {
        cityId: cityIdNum,
        desfechos: desfechos
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/summary failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Top vias com dados cumulativos
router.get("/top", async (req, res) => {
  try {
    const { 
      intervalo = "1", 
      anoInicio, 
      anoFim,
      limite = "50",
      cityId = RECIFE_CITY_ID
    } = req.query;

    const intervalNum = parseInt(intervalo as string);
    const limiteNum = parseInt(limite as string);
    const cityIdNum = parseInt(cityId as string);

    // Construir filtros de ano dinamicamente
    let whereConditions = [
      inArray(samu_calls.motivo_desf_cat, config.desfechos.validos),
      eq(samu_calls.city_id, cityIdNum)
    ];

    if (anoInicio) {
      whereConditions.push(gte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(anoInicio as string)));
    }
    if (anoFim) {
      whereConditions.push(lte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(anoFim as string)));
    }

    const whereClause = and(...whereConditions);

    // Buscar total de sinistros válidos no período
    const totalSinistros = await db
      .select({ count: sql<string>`count(*)` })
      .from(samu_calls)
      .where(whereClause);

    const totalSinistrosNum = parseInt(totalSinistros[0].count);

    // Buscar vias ordenadas por sinistros
    const topStreets = await db
      .select({
        nome_oficial_logradouro: pcr_street_names.nome_oficial_logradouro,
        count: sql<string>`count(*)`,
        km: sql<string>`ST_Length(ST_Transform(${pcr_street_names.geom}, 3857)) / 1000`
      })
      .from(samu_calls)
      .innerJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereClause)
      .groupBy(
        samu_calls.street_id,
        pcr_street_names.nome_oficial_logradouro,
        pcr_street_names.geom
      )
      .orderBy(sql`count(*) desc`)
      .limit(limiteNum);

    // Calcular dados individuais e cumulativos
    const resultado = [];
    let sinistrosCumulativo = 0;
    let kmCumulativo = 0;

    for (let i = 0; i < topStreets.length; i += intervalNum) {
      const grupo = topStreets.slice(i, i + intervalNum);
      
      const sinistrosGrupo = grupo.reduce((sum, via) => sum + parseInt(via.count), 0);
      const kmGrupo = grupo.reduce((sum, via) => sum + parseFloat(via.km), 0);
      
      sinistrosCumulativo += sinistrosGrupo;
      kmCumulativo += kmGrupo;
      
      const posicao = i + intervalNum;
      const sinistrosPorKm = kmGrupo > 0 ? sinistrosGrupo / kmGrupo : 0;
      const sinistrosPorKmAcum = kmCumulativo > 0 ? sinistrosCumulativo / kmCumulativo : 0;
      const percentual = (sinistrosGrupo / totalSinistrosNum) * 100;
      const percentualAcum = (sinistrosCumulativo / totalSinistrosNum) * 100;
      
      resultado.push({
        top: posicao,
        sinistros: sinistrosGrupo,
        sinistros_acum: sinistrosCumulativo,
        km: Math.round(kmGrupo * 100) / 100,
        km_acum: Math.round(kmCumulativo * 100) / 100,
        sinistros_por_km: Math.round(sinistrosPorKm * 100) / 100,
        sinistros_por_km_acum: Math.round(sinistrosPorKmAcum * 100) / 100,
        percentual: Math.round(percentual * 100) / 100,
        percentual_acum: Math.round(percentualAcum * 100) / 100
      });
    }

    res.json({
      dados: resultado,
      parametros: {
        intervalo: intervalNum,
        periodo: anoInicio && anoFim ? `${anoInicio}-${anoFim}` : "todos os anos",
        total_sinistros: totalSinistrosNum,
        limite: limiteNum
      }
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/top failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Buscar sinistros por via
router.get("/search", async (req, res) => {
  try {
    const { street, limit = "100", cityId = RECIFE_CITY_ID } = req.query;

    if (!street) {
      return res.status(400).json({ error: "Parâmetro 'street' é obrigatório" });
    }
    
    const cityIdNum = parseInt(cityId as string);

    const results = await db
      .select({
        id: samu_calls.id,
        data: samu_calls.data,
        hora_minuto: samu_calls.hora_minuto,
        endereco: samu_calls.endereco,
        nome_oficial_logradouro: pcr_street_names.nome_oficial_logradouro,
        nomeBairro: pcr_street_names.nomeBairro,
        categoria: samu_calls.categoria,
        subtipo: samu_calls.subtipo,
        sexo: samu_calls.sexo,
        idade: samu_calls.idade,
        motivo_fin_cat: samu_calls.motivo_fin_cat,
        motivo_desf_cat: samu_calls.motivo_desf_cat,
        geom: sql<string>`ST_AsGeoJSON(${pcr_street_names.geom})`
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(
        and(
          sql`${pcr_street_names.nome_oficial_logradouro} ILIKE ${`%${street}%`} OR ${samu_calls.endereco} ILIKE ${`%${street}%`}`,
          eq(samu_calls.city_id, cityIdNum)
        )
      )
      .orderBy(samu_calls.data)
      .limit(parseInt(limit as string));

    res.json({
      sinistros: results,
      total: results.length,
      busca: street
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/search failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Mapa GeoJSON das vias com sinistros
router.get("/map", async (req, res) => {
  try {
    const { anoInicio = "2018", anoFim = "2024", limite = "50", desfechos = "validos", cityId = RECIFE_CITY_ID } = req.query;
    
    const cityIdNum = parseInt(cityId as string);

    let whereCondition = and(
      gte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(anoInicio as string)),
      lte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, parseInt(anoFim as string)),
      eq(samu_calls.city_id, cityIdNum)
    );

    // Filtro de desfechos
    if (desfechos === "validos") {
      whereCondition = and(whereCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.validos))!;
    } else if (desfechos === "invalidos") {
      whereCondition = and(whereCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.invalidos))!;
    }
    // Se desfechos === "todos", não adiciona filtro

    const vias = await db
      .select({
        id: pcr_street_names.id,
        nome: pcr_street_names.nome_oficial_logradouro,
        sinistros: sql<string>`count(*)`,
        geometria: sql<any>`ST_AsGeoJSON(${pcr_street_names.geom})::json`
      })
      .from(samu_calls)
      .innerJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereCondition)
      .groupBy(
        samu_calls.street_id,
        pcr_street_names.id,
        pcr_street_names.nome_oficial_logradouro,
        pcr_street_names.geom
      )
      .orderBy(sql`count(*) desc`)
      .limit(parseInt(limite as string));

    const viasFormatadas = vias.map(via => ({
      id: via.id,
      nome: via.nome,
      sinistros: parseInt(via.sinistros),
      geometria: via.geometria
    }));

    res.json({
      vias: viasFormatadas,
      filtro_desfechos: desfechos
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/map failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Histórico de sinistros por via
router.get("/history", async (req, res) => {
  try {
    const { via, desfechos = "validos", cityId = RECIFE_CITY_ID } = req.query;
    
    const cityIdNum = parseInt(cityId as string);

    let whereCondition = and(
      sql`${samu_calls.data} IS NOT NULL`,
      eq(samu_calls.city_id, cityIdNum)
    );
    
    // Filtro de desfechos
    if (desfechos === "validos") {
      whereCondition = and(whereCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.validos))!;
    } else if (desfechos === "invalidos") {
      whereCondition = and(whereCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.invalidos))!;
    }
    // Se desfechos === "todos", não adiciona filtro
    
    if (via) {
      whereCondition = and(
        whereCondition,
        sql`${pcr_street_names.nome_oficial_logradouro} ILIKE ${`%${via}%`}`
      )!;
    }

    const evolucaoData = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        mes: sql<number>`EXTRACT(MONTH FROM ${samu_calls.data})`,
        count: sql<string>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereCondition)
      .groupBy(
        sql`EXTRACT(YEAR FROM ${samu_calls.data})`,
        sql`EXTRACT(MONTH FROM ${samu_calls.data})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${samu_calls.data})`,
        sql`EXTRACT(MONTH FROM ${samu_calls.data})`
      );

    // Dias com dados no ano (geral)
    let diasGeralCondition = and(
      sql`${samu_calls.data} IS NOT NULL`,
      eq(samu_calls.city_id, cityIdNum)
    );
    if (desfechos === "validos") {
      diasGeralCondition = and(diasGeralCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.validos))!;
    } else if (desfechos === "invalidos") {
      diasGeralCondition = and(diasGeralCondition, inArray(samu_calls.motivo_desf_cat, config.desfechos.invalidos))!;
    }
    
    const diasGeralData = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        dias_com_dados: sql<string>`COUNT(DISTINCT ${samu_calls.data})`,
        ultimo_dia: sql<string>`MAX(${samu_calls.data})`
      })
      .from(samu_calls)
      .where(diasGeralCondition)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    // Dias com sinistros na via específica
    const diasViaData = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        dias_com_sinistros: sql<string>`COUNT(DISTINCT ${samu_calls.data})`
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereCondition)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    // Sinistros por dia da semana
    const diasSemanaData = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        dia_semana: sql<number>`EXTRACT(DOW FROM ${samu_calls.data})`,
        count: sql<string>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereCondition)
      .groupBy(
        sql`EXTRACT(YEAR FROM ${samu_calls.data})`,
        sql`EXTRACT(DOW FROM ${samu_calls.data})`
      );

    // Sinistros por horário
    const horariosData = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        hora: sql<number>`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`,
        count: sql<string>`count(*)`
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(whereCondition)
      .groupBy(
        sql`EXTRACT(YEAR FROM ${samu_calls.data})`,
        sql`EXTRACT(HOUR FROM ${samu_calls.hora_minuto})`
      );

    const anosMap = new Map<number, { sinistros: number; meses: Record<string, number>; dias_com_dados: number; dias_com_sinistros: number; ultimo_dia: string; dias_semana: Record<string, number>; horarios: Record<string, number> }>();
    
    diasGeralData.forEach(item => {
      const horariosInit: Record<string, number> = {};
      for (let h = 0; h <= 23; h++) {
        horariosInit[h.toString()] = 0;
      }
      
      anosMap.set(item.ano, {
        sinistros: 0,
        meses: {},
        dias_com_dados: parseInt(item.dias_com_dados),
        dias_com_sinistros: 0,
        ultimo_dia: item.ultimo_dia,
        dias_semana: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 },
        horarios: horariosInit
      });
    });
    
    diasViaData.forEach(item => {
      if (anosMap.has(item.ano)) {
        anosMap.get(item.ano)!.dias_com_sinistros = parseInt(item.dias_com_sinistros);
      }
    });
    
    diasSemanaData.forEach(item => {
      if (anosMap.has(item.ano)) {
        anosMap.get(item.ano)!.dias_semana[item.dia_semana.toString()] = parseInt(item.count);
      }
    });
    
    horariosData.forEach(item => {
      if (anosMap.has(item.ano)) {
        anosMap.get(item.ano)!.horarios[item.hora.toString()] = parseInt(item.count);
      }
    });
    
    evolucaoData.forEach(item => {
      const anoData = anosMap.get(item.ano)!;
      const countNum = parseInt(item.count);
      anoData.sinistros += countNum;
      anoData.meses[item.mes.toString()] = countNum;
    });

    const evolucaoAgrupada = Array.from(anosMap.entries())
      .map(([ano, data]) => ({ ano, ...data }))
      .sort((a, b) => a.ano - b.ano);

    res.json({
      evolucao: evolucaoAgrupada,
      via: via || null,
      filtro_desfechos: desfechos
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/history failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});


export default router;