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

// Função para converter o código de idade do DATASUS para idade em anos
function converterIdadeParaAnos(idadeCodigo: number | null): number {
  if (idadeCodigo === null) return 0;
  
  const idadeStr = String(idadeCodigo);
  if (idadeStr.length < 3) return 0;
  
  const unidade = Number(idadeStr[0]);
  const quantidade = Number(idadeStr.substring(1));
  
  switch (unidade) {
    case 0: // Horas
      return 0;
    case 1: // Horas
      return 0;
    case 2: // Dias
      return 0;
    case 3: // Meses
      return Math.floor(quantidade / 12);
    case 4: // Anos
      return quantidade;
    case 5: // Anos (mais de 100)
      return 100 + quantidade;
    default:
      return 0;
  }
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
    
    // Filtro de faixa etária - Adaptado para o formato específico do DATASUS
    if (filtros.faixaEtariaMin !== undefined) {
      // Para idade em anos (código começa com 4), verificamos se o valor após o primeiro dígito é >= min
      whereClause = sql`${whereClause} AND (
        (${datasus_deaths.idade} >= 400 AND ${datasus_deaths.idade} < 500 AND 
         CAST(SUBSTRING(CAST(${datasus_deaths.idade} AS VARCHAR), 2, 2) AS INTEGER) >= ${filtros.faixaEtariaMin})
        OR
        (${datasus_deaths.idade} >= 500)
      )`;
    }
    
    if (filtros.faixaEtariaMax !== undefined) {
      // Para idade em anos (código começa com 4), verificamos se o valor após o primeiro dígito é <= max
      whereClause = sql`${whereClause} AND (
        (${datasus_deaths.idade} >= 400 AND ${datasus_deaths.idade} < 500 AND 
         CAST(SUBSTRING(CAST(${datasus_deaths.idade} AS VARCHAR), 2, 2) AS INTEGER) <= ${filtros.faixaEtariaMax})
        OR
        (${datasus_deaths.idade} >= 500 AND 
         CAST(SUBSTRING(CAST(${datasus_deaths.idade} AS VARCHAR), 2, 2) AS INTEGER) + 100 <= ${filtros.faixaEtariaMax})
      )`;
    }
    
    // Filtro de modo de transporte - Verificar apenas no campo causabas
    if (filtros.modoTransporte && filtros.modoTransporte.length > 0) {
      let modoClause = sql`false`;
      for (const modo of filtros.modoTransporte) {
        // Verificar se o modo começa com V seguido de um número (V0, V1, V2, etc.)
        const modoBase = modo.substring(0, 2); // Pega apenas V0, V1, V2, etc.
        
        // Buscar por padrões como V4, V40, V41, V42, etc. apenas em causabas
        modoClause = sql`${modoClause} OR ${datasus_deaths.causabas} LIKE ${modoBase + '%'}`;
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
        municipioNome: cities.name,
        causabas: datasus_deaths.causabas
      })
      .from(datasus_deaths)
      .leftJoin(cities, sql`${campoLocal} = ${cities.id}`)
      .where(whereClause)
      .groupBy(
        sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`, 
        datasus_deaths.sexo, 
        datasus_deaths.racacor, 
        datasus_deaths.idade, 
        campoLocal, 
        cities.name,
        datasus_deaths.causabas
      )
      .orderBy(sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();
    
    // Processar resultados para formato mais amigável
    const processedResults = result.map(row => {
      // Converter idade do formato DATASUS para anos
      const idadeEmAnos = converterIdadeParaAnos(row.idade);
      
      // Determinar faixa etária com base na idade convertida
      const faixaEtaria = config.mapeamentos.faixasEtarias.find(
        faixa => idadeEmAnos >= faixa.min && idadeEmAnos <= faixa.max
      )?.label || 'Não informado';
      
      // Determinar modo de transporte
      let modoTransporte = 'Não identificado';
      let codigoModo = '';
      
      // Verificar apenas no campo causabas
      const colunas = [row.causabas];
      for (const coluna of colunas) {
        if (!coluna) continue;
        
        // Verificar se o valor começa com V seguido de um número
        if (coluna.match(/^V[0-9]/)) {
          const prefixo = coluna.substring(0, 2);
          
          switch (prefixo) {
            case 'V0':
              modoTransporte = 'Pedestre';
              codigoModo = 'V0';
              break;
            case 'V1':
              modoTransporte = 'Ciclista';
              codigoModo = 'V1';
              break;
            case 'V2':
              modoTransporte = 'Motociclista';
              codigoModo = 'V2';
              break;
            case 'V3':
              modoTransporte = 'Ocupante de triciclo';
              codigoModo = 'V3';
              break;
            case 'V4':
              modoTransporte = 'Ocupante de automóvel';
              codigoModo = 'V4';
              break;
            case 'V5':
              modoTransporte = 'Ocupante de caminhonete';
              codigoModo = 'V5';
              break;
            case 'V6':
              modoTransporte = 'Ocupante de veículo pesado';
              codigoModo = 'V6';
              break;
            case 'V7':
              modoTransporte = 'Ocupante de ônibus';
              codigoModo = 'V7';
              break;
            case 'V8':
              modoTransporte = 'Outros modos';
              codigoModo = 'V8';
              break;
            case 'V9':
              modoTransporte = 'Não especificado';
              codigoModo = 'V9';
              break;
            default:
              // Se começar com V mas não for um dos códigos acima
              if (coluna.startsWith('V4')) {
                modoTransporte = 'Ocupante de automóvel';
                codigoModo = 'V4';
              } else if (coluna.startsWith('V2')) {
                modoTransporte = 'Motociclista';
                codigoModo = 'V2';
              } else {
                modoTransporte = 'Outro modo de transporte';
                codigoModo = coluna.substring(0, 2);
              }
          }
          
          // Se encontrou um modo de transporte, interrompe a busca
          if (codigoModo) break;
        }
      }
      
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
        idade: idadeEmAnos,
        idadeOriginal: row.idade,
        faixaEtaria,
        modoTransporte: {
          codigo: codigoModo,
          descricao: modoTransporte
        },
        causabas: row.causabas,
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
    
    // Agrupar por modo de transporte
    const porModoTransporte = processedResults.reduce((acc, item) => {
      const modo = item.modoTransporte.descricao;
      if (!acc[modo]) {
        acc[modo] = 0;
      }
      acc[modo] += item.total;
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
        porMunicipio,
        porModoTransporte
      },
      dados: processedResults
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;