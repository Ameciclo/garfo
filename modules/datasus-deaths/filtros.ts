// modules/datasus-deaths/filtros.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { datasus_deaths } from "../../db/modules/casualties/table_datasus_deaths";
import { cities } from "../../db/modules/global/table_cities";
import { sql } from "drizzle-orm";
import { config } from "./config";

const router = express.Router();

interface FiltroParams {
  municipio?: number;
  tipoLocal?: 'residencia' | 'ocorrencia';
  anoInicio?: number;
  anoFim?: number;
  sexo?: string[];
  racacor?: string[];
  faixaEtariaMin?: number;
  faixaEtariaMax?: number;
  modoTransporte?: string[];
}

router.get("/", async (req: Request, res: Response) => {
  try {
    // Extrair parâmetros de filtro da requisição
    const filtros: FiltroParams = {};
    
    // Município específico ou todos da RMR
    if (req.query.municipio && !isNaN(Number(req.query.municipio))) {
      filtros.municipio = Number(req.query.municipio);
    }
    
    // Tipo de local (residência ou ocorrência)
    filtros.tipoLocal = req.query.tipoLocal === 'residencia' ? 'residencia' : 'ocorrencia';
    
    // Anos
    if (req.query.anoInicio && !isNaN(Number(req.query.anoInicio))) {
      filtros.anoInicio = Number(req.query.anoInicio);
    } else {
      // Padrão: últimos 10 anos
      filtros.anoInicio = new Date().getFullYear() - config.periodos.anosRetroativos;
    }
    
    if (req.query.anoFim && !isNaN(Number(req.query.anoFim))) {
      filtros.anoFim = Number(req.query.anoFim);
    }
    
    // Sexo
    if (req.query.sexo) {
      filtros.sexo = Array.isArray(req.query.sexo) 
        ? req.query.sexo as string[] 
        : [req.query.sexo as string];
    }
    
    // Raça/cor
    if (req.query.racacor) {
      filtros.racacor = Array.isArray(req.query.racacor) 
        ? req.query.racacor as string[] 
        : [req.query.racacor as string];
    }
    
    // Faixa etária
    if (req.query.faixaEtariaMin && !isNaN(Number(req.query.faixaEtariaMin))) {
      filtros.faixaEtariaMin = Number(req.query.faixaEtariaMin);
    }
    
    if (req.query.faixaEtariaMax && !isNaN(Number(req.query.faixaEtariaMax))) {
      filtros.faixaEtariaMax = Number(req.query.faixaEtariaMax);
    }
    
    // Modo de transporte
    if (req.query.modoTransporte) {
      filtros.modoTransporte = Array.isArray(req.query.modoTransporte) 
        ? req.query.modoTransporte as string[] 
        : [req.query.modoTransporte as string];
    }
    
    // Construir a consulta SQL com base nos filtros
    let whereClause = sql`true`;
    
    // Campo de localização (residência ou ocorrência)
    const campoLocal = filtros.tipoLocal === 'residencia' ? datasus_deaths.codmunres : datasus_deaths.codmunocor;
    
    // Filtro de município
    if (filtros.municipio) {
      whereClause = sql`${whereClause} AND ${campoLocal} = ${filtros.municipio}`;
    } else {
      // Se não especificou município, filtra por todos da RMR
      const rmrCities = await db
        .select({ id: cities.id })
        .from(cities)
        .where(sql`${cities.rmr} = true`)
        .execute();
      
      if (rmrCities.length === 0) {
        return res.status(404).json({ error: "Nenhuma cidade da RMR encontrada" });
      }
      
      let cityClause = sql`false`;
      for (const city of rmrCities) {
        cityClause = sql`${cityClause} OR ${campoLocal} = ${city.id}`;
      }
      whereClause = sql`${whereClause} AND (${cityClause})`;
    }
    
    // Filtro de ano
    whereClause = sql`${whereClause} AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${filtros.anoInicio}`;
    if (filtros.anoFim) {
      whereClause = sql`${whereClause} AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) <= ${filtros.anoFim}`;
    }
    
    // Filtro de sexo
    if (filtros.sexo && filtros.sexo.length > 0) {
      let sexoClause = sql`false`;
      for (const sexo of filtros.sexo) {
        sexoClause = sql`${sexoClause} OR ${datasus_deaths.sexo} = ${sexo}`;
      }
      whereClause = sql`${whereClause} AND (${sexoClause})`;
    }
    
    // Filtro de raça/cor
    if (filtros.racacor && filtros.racacor.length > 0) {
      let racacorClause = sql`false`;
      for (const racacor of filtros.racacor) {
        racacorClause = sql`${racacorClause} OR ${datasus_deaths.racacor} = ${racacor}`;
      }
      whereClause = sql`${whereClause} AND (${racacorClause})`;
    }
    
    // Filtro de faixa etária
    if (filtros.faixaEtariaMin !== undefined) {
      whereClause = sql`${whereClause} AND ${datasus_deaths.idade} >= ${filtros.faixaEtariaMin}`;
    }
    
    if (filtros.faixaEtariaMax !== undefined) {
      whereClause = sql`${whereClause} AND ${datasus_deaths.idade} <= ${filtros.faixaEtariaMax}`;
    }
    
    // Filtro de modo de transporte (baseado no início do código CID-10 na linhaa)
    if (filtros.modoTransporte && filtros.modoTransporte.length > 0) {
      let modoClause = sql`false`;
      for (const modo of filtros.modoTransporte) {
        modoClause = sql`${modoClause} OR ${datasus_deaths.linhaa} LIKE ${modo + '%'}`;
      }
      whereClause = sql`${whereClause} AND (${modoClause})`;
    }
    
    // Consulta principal
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        ano: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        sexo: datasus_deaths.sexo,
        racacor: datasus_deaths.racacor,
        idade: datasus_deaths.idade,
        municipio: campoLocal,
        municipioNome: cities.name
      })
      .from(datasus_deaths)
      .leftJoin(cities, sql`${campoLocal} = ${cities.id}`)
      .where(whereClause)
      .groupBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`, datasus_deaths.sexo, datasus_deaths.racacor, datasus_deaths.idade, campoLocal, cities.name)
      .orderBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();
    
    // Processar resultados para formato mais amigável
    const processedResults = result.map(row => {
      // Determinar faixa etária
      const idade = row.idade !== null ? Number(row.idade) : 0;
      const faixaEtaria = config.mapeamentos.faixasEtarias.find(
        faixa => idade >= faixa.min && idade <= faixa.max
      )?.label || 'Não informado';
      
      return {
        ano: Number(row.ano),
        municipio: {
          id: row.municipio,
          nome: row.municipioNome
        },
        sexo: {
          codigo: row.sexo,
          descricao: row.sexo ? config.mapeamentos.sexo[row.sexo as keyof typeof config.mapeamentos.sexo] || 'Não informado' : 'Não informado'
        },
        racacor: {
          codigo: row.racacor,
          descricao: row.racacor ? config.mapeamentos.racacor[row.racacor as keyof typeof config.mapeamentos.racacor] || 'Não informado' : 'Não informado'
        },
        idade,
        faixaEtaria,
        total: Number(row.total)
      };
    });
    
    // Calcular totais
    const totalGeral = processedResults.reduce((sum, item) => sum + item.total, 0);
    
    // Agrupar por ano
    const porAno = processedResults.reduce((acc, item) => {
      const ano = item.ano;
      if (!acc[ano]) {
        acc[ano] = 0;
      }
      acc[ano] += item.total;
      return acc;
    }, {} as Record<number, number>);
    
    // Agrupar por sexo
    const porSexo = processedResults.reduce((acc, item) => {
      const sexo = item.sexo.descricao;
      if (!acc[sexo]) {
        acc[sexo] = 0;
      }
      acc[sexo] += item.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Agrupar por raça/cor
    const porRacaCor = processedResults.reduce((acc, item) => {
      const racacor = item.racacor.descricao;
      if (!acc[racacor]) {
        acc[racacor] = 0;
      }
      acc[racacor] += item.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Agrupar por faixa etária
    const porFaixaEtaria = processedResults.reduce((acc, item) => {
      const faixaEtaria = item.faixaEtaria;
      if (!acc[faixaEtaria]) {
        acc[faixaEtaria] = 0;
      }
      acc[faixaEtaria] += item.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Agrupar por município
    const porMunicipio = processedResults.reduce((acc, item) => {
      const municipio = item.municipio.nome || 'Não informado';
      if (!acc[municipio]) {
        acc[municipio] = 0;
      }
      acc[municipio] += item.total;
      return acc;
    }, {} as Record<string, number>);
    
    // Resposta final
    res.json({
      filtrosAplicados: filtros,
      totalGeral,
      resumo: {
        porAno,
        porSexo,
        porRacaCor,
        porFaixaEtaria,
        porMunicipio
      },
      dados: processedResults
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;