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
    // Verificar se é por local de residência ou ocorrência
    const tipoLocal = req.query.tipo === 'residencia' ? 'residencia' : 'ocorrencia';
    const campoLocal = tipoLocal === 'residencia' ? datasus_deaths.codmunres : datasus_deaths.codmunocor;
    
    // Verificar se há filtro por local de ocorrência do óbito
    const localOcorrenciaObito = req.query.localOcorrenciaObito ? String(req.query.localOcorrenciaObito) : null;
    
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
    
    if (localOcorrenciaObito) {
      finalWhereClause = sql`${finalWhereClause} AND ${datasus_deaths.lococor} = ${localOcorrenciaObito}`;
    }
    
    // Consulta para obter mortes por cidade e ano
    const result = await db
      .select({
        cityId: campoLocal,
        cityName: cities.name,
        year: sql<number>`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .leftJoin(cities, sql`${campoLocal} = ${cities.id}`)
      .where(finalWhereClause)
      .groupBy(campoLocal, cities.name, sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .orderBy(cities.name, sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito})`)
      .execute();

    // Organizar os dados em formato de tabela cidade x ano
    const cityYearMap = new Map<number, CityYearData>();
    const years = new Set<string>();
    
    // Coletar todos os anos e dados por cidade
    result.forEach(row => {
      if (row.cityId === null) return;
      
      const year = String(row.year);
      years.add(year);
      
      if (!cityYearMap.has(row.cityId)) {
        cityYearMap.set(row.cityId, {
          cityId: row.cityId,
          cityName: row.cityName,
          yearData: {}
        });
      }
      
      const cityData = cityYearMap.get(row.cityId);
      if (cityData) {
        cityData.yearData[year] = Number(row.count);
      }
    });
    
    // Converter para array e ordenar anos
    const sortedYears = Array.from(years).sort();
    
    // Formatar a resposta final
    const response = {
      tipo: tipoLocal === 'residencia' ? 'Local de Residência' : 'Local de Ocorrência',
      localOcorrenciaObito: req.query.localOcorrenciaObito ? {
        valor: req.query.localOcorrenciaObito,
        descricao: getLocalOcorrenciaDescricao(String(req.query.localOcorrenciaObito))
      } : null,
      anos: sortedYears.map(year => parseInt(year)),
      cidades: Array.from(cityYearMap.values()).map(city => {
        const yearValues: Record<string, number> = {};
        sortedYears.forEach(year => {
          yearValues[year] = city.yearData[year] || 0;
        });
        
        // Calcular o total somando todos os valores anuais
        const total = Object.values(city.yearData).reduce(
          (sum, val) => sum + val, 
          0
        );
        
        return {
          id: city.cityId,
          nome: city.cityName,
          ...yearValues,
          total
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