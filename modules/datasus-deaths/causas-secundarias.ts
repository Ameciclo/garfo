// modules/datasus-deaths/causas-secundarias.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { datasus_deaths } from "../../db/modules/casualties/table_datasus_deaths";
import { cities } from "../../db/modules/global/table_cities";
import { sql } from "drizzle-orm";
import { config } from "./config";

const router = express.Router();

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

// Função para obter a descrição do sexo
function getSexoDescricao(codigo: string): string {
  switch (codigo) {
    case '1': return 'Masculino';
    case '2': return 'Feminino';
    case '0': return 'Não informado';
    case '9': return 'Ignorado';
    default: return 'Desconhecido';
  }
}

// Função para obter o modo de transporte a partir do CID
function getModoTransporte(cid: string): string | null {
  const prefixo = cid.substring(0, 1);
  const grupo = cid.substring(0, 2);
  
  if (prefixo !== 'V') return null;
  
  switch (grupo) {
    case 'V0': return 'Pedestre';
    case 'V1': return 'Ciclista';
    case 'V2': return 'Motociclista';
    case 'V3': return 'Ocupante de triciclo motorizado';
    case 'V4': return 'Ocupante de automóvel';
    case 'V5': return 'Ocupante de caminhonete';
    case 'V6': return 'Ocupante de veículo pesado';
    case 'V7': return 'Ocupante de ônibus';
    case 'V8': return 'Outros modos';
    case 'V9': return 'Não especificado';
    default: return null;
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    // Parâmetros de filtro
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const startYear = req.query.startYear ? Number(req.query.startYear) : undefined;
    const endYear = req.query.endYear ? Number(req.query.endYear) : undefined;
    const idadeMin = req.query.idadeMin ? Number(req.query.idadeMin) : undefined;
    const idadeMax = req.query.idadeMax ? Number(req.query.idadeMax) : undefined;
    const sexo = req.query.sexo ? String(req.query.sexo) : undefined;
    const modoTransporte = req.query.modoTransporte ? String(req.query.modoTransporte) : undefined;
    const localOcorrenciaObito = req.query.localOcorrenciaObito ? String(req.query.localOcorrenciaObito) : undefined;
    const tipoLocal = req.query.tipoLocal === 'residencia' ? 'residencia' : 'ocorrencia';
    
    // Definir período padrão se não especificado
    const currentYear = new Date().getFullYear();
    const defaultStartYear = currentYear - config.periodos.anosRetroativos;
    
    // Usar valores padrão se não fornecidos
    const fromYear = startYear || defaultStartYear;
    const toYear = endYear || currentYear;
    
    // Determinar qual campo usar com base no parâmetro tipoLocal
    const locationField = tipoLocal === 'residencia' ? datasus_deaths.codmunres : datasus_deaths.codmunocor;
    
    // Construir a cláusula WHERE base
    let whereConditions = [
      sql`EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) BETWEEN ${fromYear} AND ${toYear}`
    ];
    
    // Adicionar filtro por cidade ou RMR
    if (cityId) {
      whereConditions.push(sql`${locationField} = ${cityId}`);
    } else {
      // Buscar cidades da RMR
      const rmrCities = await db
        .select({ id: cities.id })
        .from(cities)
        .where(sql`${cities.rmr} = true`)
        .execute();
      
      if (rmrCities.length === 0) {
        return res.status(404).json({ error: "Nenhuma cidade da RMR encontrada" });
      }
      
      // Construir a cláusula WHERE para incluir todas as cidades da RMR
      let rmrWhereClause = sql`false`;
      for (const city of rmrCities) {
        rmrWhereClause = sql`${rmrWhereClause} OR ${locationField} = ${city.id}`;
      }
      
      whereConditions.push(sql`(${rmrWhereClause})`);
    }
    
    // Adicionar filtros adicionais
    if (idadeMin !== undefined) {
      whereConditions.push(sql`${datasus_deaths.idade} >= ${idadeMin}`);
    }
    
    if (idadeMax !== undefined) {
      whereConditions.push(sql`${datasus_deaths.idade} <= ${idadeMax}`);
    }
    
    if (sexo) {
      whereConditions.push(sql`${datasus_deaths.sexo} = ${sexo}`);
    }
    
    if (localOcorrenciaObito) {
      whereConditions.push(sql`${datasus_deaths.lococor} = ${localOcorrenciaObito}`);
    }
    
    if (modoTransporte) {
      whereConditions.push(sql`SUBSTRING(${datasus_deaths.causabas}, 1, 2) = ${modoTransporte}`);
    }
    
    // Combinar todas as condições
    let whereClause = whereConditions[0];
    for (let i = 1; i < whereConditions.length; i++) {
      whereClause = sql`${whereClause} AND ${whereConditions[i]}`;
    }
    
    // Consulta para obter as causas secundárias
    const result = await db
      .select({
        linhaa: datasus_deaths.linhaa,
        linhab: datasus_deaths.linhab,
        linhac: datasus_deaths.linhac,
        linhad: datasus_deaths.linhad,
        linhaii: datasus_deaths.linhaii,
        causabas: datasus_deaths.causabas,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .where(whereClause)
      .groupBy(
        datasus_deaths.linhaa,
        datasus_deaths.linhab,
        datasus_deaths.linhac,
        datasus_deaths.linhad,
        datasus_deaths.linhaii,
        datasus_deaths.causabas
      )
      .orderBy(sql`count(*) DESC`)
      .execute();
    
    // Agrupar as causas secundárias
    const causasSecundarias: {
      linhaa: Record<string, number>;
      linhab: Record<string, number>;
      linhac: Record<string, number>;
      linhad: Record<string, number>;
      linhaii: Record<string, number>;
    } = {
      linhaa: {},
      linhab: {},
      linhac: {},
      linhad: {},
      linhaii: {}
    };
    
    // Processar os resultados
    result.forEach(row => {
      // Processar linha A
      if (row.linhaa) {
        causasSecundarias.linhaa[row.linhaa] = (causasSecundarias.linhaa[row.linhaa] || 0) + Number(row.count);
      }
      
      // Processar linha B
      if (row.linhab) {
        causasSecundarias.linhab[row.linhab] = (causasSecundarias.linhab[row.linhab] || 0) + Number(row.count);
      }
      
      // Processar linha C
      if (row.linhac) {
        causasSecundarias.linhac[row.linhac] = (causasSecundarias.linhac[row.linhac] || 0) + Number(row.count);
      }
      
      // Processar linha D
      if (row.linhad) {
        causasSecundarias.linhad[row.linhad] = (causasSecundarias.linhad[row.linhad] || 0) + Number(row.count);
      }
      
      // Processar linha II
      if (row.linhaii) {
        causasSecundarias.linhaii[row.linhaii] = (causasSecundarias.linhaii[row.linhaii] || 0) + Number(row.count);
      }
    });
    
    // Converter para arrays ordenados por frequência
    const formatarCausas = (causas: Record<string, number>) => {
      return Object.entries(causas)
        .map(([codigo, count]) => ({ codigo, count }))
        .sort((a, b) => b.count - a.count);
    };
    
    const causasFormatadas = {
      linhaa: formatarCausas(causasSecundarias.linhaa),
      linhab: formatarCausas(causasSecundarias.linhab),
      linhac: formatarCausas(causasSecundarias.linhac),
      linhad: formatarCausas(causasSecundarias.linhad),
      linhaii: formatarCausas(causasSecundarias.linhaii)
    };
    
    // Calcular totais
    const totalRegistros = result.reduce((sum, row) => sum + Number(row.count), 0);
    
    // Preparar metadados dos filtros aplicados
    const filtrosAplicados: Record<string, any> = {
      cidade: cityId,
      tipoLocal,
      periodoAnos: {
        inicio: fromYear,
        fim: toYear
      }
    };
    
    if (idadeMin !== undefined || idadeMax !== undefined) {
      filtrosAplicados['faixaEtaria'] = {
        min: idadeMin,
        max: idadeMax
      };
    }
    
    if (sexo) {
      filtrosAplicados['sexo'] = {
        codigo: sexo,
        descricao: getSexoDescricao(sexo)
      };
    }
    
    if (modoTransporte) {
      filtrosAplicados['modoTransporte'] = {
        codigo: modoTransporte,
        descricao: getModoTransporte(modoTransporte)
      };
    }
    
    if (localOcorrenciaObito) {
      filtrosAplicados['localOcorrenciaObito'] = {
        codigo: localOcorrenciaObito,
        descricao: getLocalOcorrenciaDescricao(localOcorrenciaObito)
      };
    }
    
    // Montar a resposta
    res.json({
      filtrosAplicados,
      totalRegistros,
      causasSecundarias: causasFormatadas,
      descricao: "Causas secundárias das mortes por sinistro de trânsito"
    });
    
  } catch (error) {
    console.error("Erro ao obter causas secundárias:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
});

export default router;