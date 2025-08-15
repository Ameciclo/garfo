// modules/datasus-deaths/cities-by-year.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { datasus_deaths } from "../../db/modules/casualties/table_datasus_deaths";
import { cities } from "../../db/modules/global/table_cities";
import { sql } from "drizzle-orm";
import { config } from "./config";

const router = express.Router();

// Interfaces para tipagem
interface CityYearData {
  cityId: number;
  cityName: string | null;
  yearData: Record<string, number>;
  transportModeData: Record<string, Record<string, number>>;
}

interface TransportModeData {
  [year: string]: Record<string, number>;
}

// Função para obter a descrição do local de ocorrência do óbito
function getLocalOcorrenciaDescricao(codigo: string): string {
  switch (codigo) {
    case '1': return 'Hospital';
    case '2': return 'Outros estabelecimentos de saúde';
    case '3': return 'Domicílio';
    case '4': return 'Via pública';
    case '5': return 'Outros';
    case '9': return 'Ignorado';
    default: return 'Desconhecido';
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    // Verificar se é por local de residência ou ocorrência (type ou tipo)
    let locationType: string;
    if (req.query.type === 'residence' || req.query.tipo === 'residencia') {
      locationType = 'residence';
    } else {
      locationType = 'occurrence';
    }
    const campoLocal = locationType === 'residence' ? datasus_deaths.codmunres : datasus_deaths.codmunocor;
    
    // Verificar se há filtro por local de ocorrência do óbito (deathLocation ou localOcorrenciaObito)
    let deathLocation: string | string[] | null = null;
    
    const processDeathLocation = (param: string | string[] | undefined) => {
      if (!param) return null;
      
      if (Array.isArray(param)) {
        return param;
      } else {
        // Se for uma string única, verifica se contém valores separados por vírgula
        return param.includes(',') ? param.split(',') : param;
      }
    };
    
    if (req.query.deathLocation) {
      deathLocation = processDeathLocation(req.query.deathLocation as string | string[]);
    } else if (req.query.localOcorrenciaObito) {
      deathLocation = processDeathLocation(req.query.localOcorrenciaObito as string | string[]);
    }
    
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
      whereClause = sql`${whereClause} OR ${campoLocal} = ${city.id}`;
    }
    
    // Adicionar filtro por local de ocorrência do óbito se especificado
    let finalWhereClause = sql`(${whereClause}) AND EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) >= ${startYear}`;
    
    if (deathLocation) {
      if (Array.isArray(deathLocation)) {
        let localClause = sql`false`;
        for (const local of deathLocation) {
          localClause = sql`${localClause} OR ${datasus_deaths.lococor} = ${local}`;
        }
        finalWhereClause = sql`${finalWhereClause} AND (${localClause})`;
      } else {
        finalWhereClause = sql`${finalWhereClause} AND ${datasus_deaths.lococor} = ${deathLocation}`;
      }
    }
    
    // Consulta para obter mortes por cidade, ano e modo de transporte
    const result = await db
      .select({
        cityId: campoLocal,
        cityName: cities.name,
        year: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        causabas: datasus_deaths.causabas,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .leftJoin(cities, sql`${campoLocal} = ${cities.id}`)
      .where(finalWhereClause)
      .groupBy(campoLocal, cities.name, sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`, datasus_deaths.causabas)
      .orderBy(cities.name, sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();

    // Função para obter o modo de transporte a partir do CID
    const getTransportMode = (cid: string | null): string => {
      if (!cid) return 'Não identificado';
      
      const prefixo = cid.substring(0, 2);
      switch (prefixo) {
        case 'V0': return 'Pedestre';
        case 'V1': return 'Ciclista';
        case 'V2': return 'Motociclista';
        case 'V3': return 'Ocupante de triciclo';
        case 'V4': return 'Ocupante de automóvel';
        case 'V5': return 'Ocupante de caminhonete';
        case 'V6': return 'Ocupante de veículo pesado';
        case 'V7': return 'Ocupante de ônibus';
        case 'V8': return 'Outros modos';
        case 'V9': return 'Não especificado';
        default: return 'Não identificado';
      }
    };

    // Organizar os dados em formato de tabela cidade x ano
    const cityYearMap = new Map<number, CityYearData>();
    const years = new Set<string>();
    const transportModes = new Set<string>();
    
    // Coletar todos os anos, dados por cidade e modos de transporte
    result.forEach(row => {
      if (row.cityId === null) return;
      
      const year = String(row.year);
      const transportMode = getTransportMode(row.causabas);
      
      years.add(year);
      transportModes.add(transportMode);
      
      if (!cityYearMap.has(row.cityId)) {
        cityYearMap.set(row.cityId, {
          cityId: row.cityId,
          cityName: row.cityName,
          yearData: {},
          transportModeData: {}
        });
      }
      
      const cityData = cityYearMap.get(row.cityId);
      if (cityData) {
        // Dados por ano
        if (!cityData.yearData[year]) {
          cityData.yearData[year] = 0;
        }
        cityData.yearData[year] += Number(row.count);
        
        // Dados por modo de transporte e ano
        if (!cityData.transportModeData[transportMode]) {
          cityData.transportModeData[transportMode] = {};
        }
        if (!cityData.transportModeData[transportMode][year]) {
          cityData.transportModeData[transportMode][year] = 0;
        }
        cityData.transportModeData[transportMode][year] += Number(row.count);
      }
    });
    
    // Converter para array e ordenar anos e modos de transporte
    const sortedYears = Array.from(years).sort();
    const sortedTransportModes = Array.from(transportModes).sort();
    
    // Formatar a resposta final
    const response = {
      locationType: locationType === 'residence' ? 'Residence Location' : 'Occurrence Location',
      deathLocation: deathLocation ? {
        value: Array.isArray(deathLocation) ? deathLocation.join(',') : deathLocation,
        description: Array.isArray(deathLocation) 
          ? deathLocation.map(loc => getLocalOcorrenciaDescricao(loc)).join(', ')
          : getLocalOcorrenciaDescricao(deathLocation)
      } : null,
      years: sortedYears.map(year => parseInt(year)),
      transportModes: sortedTransportModes,
      cities: Array.from(cityYearMap.values()).map(city => {
        const yearValues: Record<string, number> = {};
        sortedYears.forEach(year => {
          yearValues[year] = city.yearData[year] || 0;
        });
        
        // Calcular o total somando todos os valores anuais
        const total = Object.values(city.yearData).reduce(
          (sum, val) => sum + val, 
          0
        );
        
        // Dados por modo de transporte
        const transportModeBreakdown: Record<string, any> = {};
        sortedTransportModes.forEach(mode => {
          const modeYearData: Record<string, number> = {};
          sortedYears.forEach(year => {
            modeYearData[year] = city.transportModeData[mode]?.[year] || 0;
          });
          
          const modeTotal = Object.values(city.transportModeData[mode] || {}).reduce(
            (sum, val) => sum + val, 
            0
          );
          
          transportModeBreakdown[mode] = {
            ...modeYearData,
            total: modeTotal
          };
        });
        
        return {
          id: city.cityId,
          name: city.cityName,
          ...yearValues,
          total,
          transportModes: transportModeBreakdown
        };
      })
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;