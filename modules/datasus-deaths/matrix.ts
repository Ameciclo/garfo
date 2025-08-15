// modules/datasus-deaths/matrix.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { datasus_deaths } from "../../db/modules/casualties/table_datasus_deaths";
import { cities } from "../../db/modules/global/table_cities";
import { sql } from "drizzle-orm";
import { config } from "./config";

const router = express.Router();

// Mapeamento de códigos CID para tipos de vítimas e contrapartes
const victimTypeMap: Record<string, string> = {
  // Pedestres (V01-V09) - não tem 07 e 08
  V01: "pedestre",
  V02: "pedestre",
  V03: "pedestre",
  V04: "pedestre",
  V05: "pedestre",
  V06: "pedestre",
  V09: "pedestre",

  // Ciclistas (V10-V19)
  V10: "ciclista",
  V11: "ciclista",
  V12: "ciclista",
  V13: "ciclista",
  V14: "ciclista",
  V15: "ciclista",
  V16: "ciclista",
  V17: "ciclista",
  V18: "ciclista",
  V19: "ciclista",

  // Motociclistas (V20-V29)
  V20: "motociclista",
  V21: "motociclista",
  V22: "motociclista",
  V23: "motociclista",
  V24: "motociclista",
  V25: "motociclista",
  V26: "motociclista",
  V27: "motociclista",
  V28: "motociclista",
  V29: "motociclista",

  // Ocupantes de triciclo motorizado (V30-V39) - serão consideradas outros
  V30: "outros",
  V31: "outros",
  V32: "outros",
  V33: "outros",
  V34: "outros",
  V35: "outros",
  V36: "outros",
  V37: "outros",
  V38: "outros",
  V39: "outros",

  // Ocupantes de automóveis (V40-V49)
  V40: "automovel",
  V41: "automovel",
  V42: "automovel",
  V43: "automovel",
  V44: "automovel",
  V45: "automovel",
  V46: "automovel",
  V47: "automovel",
  V48: "automovel",
  V49: "automovel",

  // Ocupantes de caminhonetes (V50-V59) - serão consideradas automóveis
  V50: "automovel",
  V51: "automovel",
  V52: "automovel",
  V53: "automovel",
  V54: "automovel",
  V55: "automovel",
  V56: "automovel",
  V57: "automovel",
  V58: "automovel",
  V59: "automovel",

  // Ocupantes de veículos pesadso (V60-V69) - serão considerados outros
  V60: "outros",
  V61: "outros",
  V62: "outros",
  V63: "outros",
  V64: "outros",
  V65: "outros",
  V66: "outros",
  V67: "outros",
  V68: "outros",
  V69: "outros",

  // Ocupantes de onibus (V70-V79)
  V70: "onibus",
  V71: "onibus",
  V72: "onibus",
  V73: "onibus",
  V74: "onibus",
  V75: "onibus",
  V76: "onibus",
  V77: "onibus",
  V78: "onibus",
  V79: "onibus",

  // Outros veículos (V80-V89)
  V80: "outros",
  V81: "outros",
  V82: "outros",
  V83: "outros",
  V84: "outros",
  V85: "outros",
  V86: "outros",
  V87: "outros",
  V88: "outros",
  V89: "outros",
};

// Mapeamento de códigos CID para contrapartes
const counterpartMap: Record<string, string> = {
  // Contrapartes para pedestres (V01-V09)
  V01: "ciclista", // Pedestre x Veículo a pedal
  V02: "motociclista", // Pedestre x Veículo a motor de duas ou três rodas
  V03: "automovel", // Pedestre x Automóvel
  V04: "onibus", // Pedestre x Veículo pesado ou onibus
  V05: "outros", // Pedestre x Trem
  V06: "ciclista", // Pedestre x Outro veículo não-motorizado
  V09: "nao_especificado", // Pedestre x Não especificado

  // Contrapartes para ciclistas (V10-V19)
  V10: "pedestre", // Ciclista x Pedestre
  V11: "ciclista", // Ciclista x Outro ciclista
  V12: "motociclista", // Ciclista x Veículo a motor de duas ou três rodas
  V13: "automovel", // Ciclista x Automóvel
  V14: "onibus", // Ciclista x Veículo pesado ou onibus
  V15: "outros", // Ciclista x Trem
  V16: "ciclista", // Ciclista x Outro veículo não-motorizado
  V17: "objeto_fixo", // Ciclista x Objeto fixo
  V18: "sem_colisao", // Ciclista x Sem colisão
  V19: "nao_especificado", // Ciclista x Não especificado

  // Contrapartes para motociclistas (V20-V29) - seguindo o mesmo padrão
  V20: "pedestre", // Motociclista x Pedestre
  V21: "ciclista", // Motociclista x Ciclista
  V22: "motociclista", // Motociclista x Outro motociclista
  V23: "automovel", // Motociclista x Automóvel
  V24: "onibus", // Motociclista x Veículo pesado ou onibus
  V25: "outros", // Motociclista x Trem
  V26: "ciclista", // Motociclista x Outro veículo não-motorizado
  V27: "objeto_fixo", // Motociclista x Objeto fixo
  V28: "sem_colisao", // Motociclista x Sem colisão
  V29: "nao_especificado", // Motociclista x Não especificado

  // Contrapartes para  triciclo motorizado (V30-V39) - serão consideradas outros
  V30: "pedestre", // triciclo motorizado x Pedestre
  V31: "ciclista", // triciclo motorizado x Ciclista
  V32: "motociclista", // triciclo motorizado x Outro motociclista
  V33: "automovel", // triciclo motorizado x Automóvel
  V34: "onibus", // triciclo motorizado x Veículo pesado ou onibus
  V35: "outros", // triciclo motorizado x Trem
  V36: "ciclista", // triciclo motorizado x Outro veículo não-motorizado
  V37: "objeto_fixo", // triciclo motorizado x Objeto fixo
  V38: "sem_colisao", // triciclo motorizado x Sem colisão
  V39: "nao_especificado", // triciclo motorizado x Não especificado

  // Contrapartes para ocupantes de automóveis (V40-V49)
  V40: "pedestre", // Automóvel x Pedestre
  V41: "ciclista", // Automóvel x Ciclista
  V42: "motociclista", // Automóvel x Motociclista
  V43: "automovel", // Automóvel x Outro automóvel
  V44: "onibus", // Automóvel x Veículo pesado ou onibus
  V45: "outros", // Automóvel x Trem
  V46: "ciclista", // Automóvel x Outro veículo não-motorizado
  V47: "objeto_fixo", // Automóvel x Objeto fixo
  V48: "sem_colisao", // Automóvel x Sem colisão
  V49: "nao_especificado", // Automóvel x Não especificado

  // Contrapartes para ocupantes de caminhonetes (V50-V59) - serão considerados automóveis
  V50: "pedestre", // caminhonetes x Pedestre
  V51: "ciclista", // caminhonetes x Ciclista
  V52: "motociclista", // caminhonetes x Motociclista
  V53: "automovel", // caminhonetes x Outro automóvel
  V54: "onibus", // caminhonetes x Veículo pesado ou onibus
  V55: "outros", // caminhonetes x Trem
  V56: "ciclista", // caminhonetes x Outro veículo não-motorizado
  V57: "objeto_fixo", // caminhonetes x Objeto fixo
  V58: "sem_colisao", // caminhonetes x Sem colisão
  V59: "nao_especificado", // caminhonetes x Não especificado

  // Contrapartes para ocupantes de veículos pesados (V60-V69) - serão considerados outros
  V60: "pedestre", // ocupantes de veículos pesados x Pedestre
  V61: "ciclista", // ocupantes de veículos pesados x Ciclista
  V62: "motociclista", // ocupantes de veículos pesados x Motociclista
  V63: "automovel", // ocupantes de veículos pesados x Outro automóvel
  V64: "onibus", // ocupantes de veículos pesados x Veículo pesado ou onibus
  V65: "outros", // ocupantes de veículos pesados x Trem
  V66: "ciclista", // ocupantes de veículos pesados x Outro veículo não-motorizado
  V67: "objeto_fixo", // ocupantes de veículos pesados x Objeto fixo
  V68: "sem_colisao", // ocupantes de veículos pesados x Sem colisão
  V69: "nao_especificado", // ocupantes de veículos pesados x Não especificado

  // Contrapartes para ocupantes de onibus (V70-V79)
  V70: "pedestre", // ocupantes de onibus x Pedestre
  V71: "ciclista", // ocupantes de onibus x Ciclista
  V72: "motociclista", // ocupantes de onibus x Motociclista
  V73: "automovel", // ocupantes de onibus x Outro automóvel
  V74: "onibus", // ocupantes de onibus x Veículo pesado ou onibus
  V75: "outros", // ocupantes de onibus x Trem
  V76: "ciclista", // ocupantes de onibus x Outro veículo não-motorizado
  V77: "objeto_fixo", // ocupantes de onibus x Objeto fixo
  V78: "sem_colisao", // ocupantes de onibus x Sem colisão
  V79: "nao_especificado", // ocupantes de onibus x Não especificado

  // Contrapartes para outros veículos (V80-V89)
  V80: "pedestre", // outros veículos x Pedestre
  V81: "ciclista", // outros veículos x Ciclista
  V82: "motociclista", // outros veículos x Motociclista
  V83: "automovel", // outros veículos x Outro automóvel
  V84: "onibus", // outros veículos x Veículo pesado ou onibus
  V85: "outros", // outros veículos x Trem
  V86: "ciclista", // outros veículos x Outro veículo não-motorizado
  V87: "objeto_fixo", // outros veículos x Objeto fixo
  V88: "sem_colisao", // outros veículos x Sem colisão
  V89: "nao_especificado", // outros veículos x Não especificado
};

// Função para obter a matriz de colisão para uma cidade ou RMR
async function getCollisionMatrix(
  cityId?: number,
  startYear?: number,
  endYear?: number,
  byResidence: boolean = false,
  deathLocation?: string | string[]
) {
  try {
    // Definir período padrão se não especificado
    const currentYear = new Date().getFullYear();
    const defaultStartYear = currentYear - config.periodos.anosRetroativos;

    // Usar valores padrão se não fornecidos
    const fromYear = startYear || defaultStartYear;
    const toYear = endYear || currentYear;

    // Determinar qual campo usar com base no parâmetro byResidence
    const locationField = byResidence
      ? datasus_deaths.codmunres
      : datasus_deaths.codmunocor;

    // Construir a cláusula WHERE para filtrar por cidade ou RMR
    let whereClause;

    if (cityId) {
      // Filtrar por cidade específica
      whereClause = sql`${locationField} = ${cityId} AND 
                       EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) BETWEEN ${fromYear} AND ${toYear}`;
    } else {
      // Buscar cidades da RMR
      const rmrCities = await db
        .select({ id: cities.id })
        .from(cities)
        .where(sql`${cities.rmr} = true`)
        .execute();

      if (rmrCities.length === 0) {
        throw new Error("Nenhuma cidade da RMR encontrada");
      }

      // Construir a cláusula WHERE para incluir todas as cidades da RMR
      let rmrWhereClause = sql`false`;
      for (const city of rmrCities) {
        rmrWhereClause = sql`${rmrWhereClause} OR ${locationField} = ${city.id}`;
      }

      whereClause = sql`(${rmrWhereClause}) AND 
                        EXTRACT(YEAR FROM ${datasus_deaths.dtobito}) BETWEEN ${fromYear} AND ${toYear}`;
    }
    
    // Adicionar filtro por local de morte (lococor) se especificado
    if (deathLocation) {
      // Converter para array se for string com valores separados por vírgula
      const locations = Array.isArray(deathLocation) 
        ? deathLocation 
        : deathLocation.includes(',') 
          ? deathLocation.split(',') 
          : [deathLocation];
      
      if (locations.length > 0) {
        let locationClause = sql`false`;
        for (const loc of locations) {
          locationClause = sql`${locationClause} OR ${datasus_deaths.lococor} = ${loc}`;
        }
        whereClause = sql`${whereClause} AND (${locationClause})`;
      }
    }

    // Buscar os dados de mortes por CID
    const deathsByCID = await db
      .select({
        causabas: datasus_deaths.causabas,
        count: sql<number>`count(*)`,
      })
      .from(datasus_deaths)
      .where(whereClause)
      .groupBy(datasus_deaths.causabas)
      .execute();

    // Definir tipos para a matriz de colisão
    type CounterpartType = {
      pedestre: number;
      ciclista: number;
      motociclista: number;
      automovel: number;
      onibus: number;
      outros: number;
      objeto_fixo: number;
      sem_colisao: number;
      nao_especificado: number;
      total: number;
    };

    type CollisionMatrixType = {
      pedestre: CounterpartType;
      ciclista: CounterpartType;
      motociclista: CounterpartType;
      automovel: CounterpartType;
      onibus: CounterpartType;
      outros: CounterpartType;
      total: CounterpartType;
    };

    // Inicializar a matriz de colisão
    const collisionMatrix: CollisionMatrixType = {
      pedestre: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      ciclista: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      motociclista: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      automovel: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      onibus: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      outros: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
      total: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        onibus: 0,
        outros: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0,
      },
    };

    // Preencher a matriz com os dados
    for (const death of deathsByCID) {
      const cid = death.causabas?.substring(0, 3);
      if (!cid) continue;

      const victimType = victimTypeMap[cid];
      const counterpartType = counterpartMap[cid];

      if (
        victimType &&
        counterpartType &&
        collisionMatrix[victimType as keyof typeof collisionMatrix]
      ) {
        const count = Number(death.count) || 0;
        const victim = victimType as keyof typeof collisionMatrix;
        const counterpart =
          counterpartType as keyof typeof collisionMatrix.pedestre;

        collisionMatrix[victim][counterpart] += count;
        collisionMatrix[victim].total += count;
        collisionMatrix.total[counterpart] += count;
        collisionMatrix.total.total += count;
      }
    }

    return collisionMatrix;
  } catch (error) {
    console.error("Erro ao obter matriz de colisão:", error);
    throw error;
  }
}

// Endpoint para obter a matriz de colisão
router.get("/", async (req: Request, res: Response) => {
  try {
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const startYear = req.query.startYear
      ? Number(req.query.startYear)
      : undefined;
    const endYear = req.query.endYear ? Number(req.query.endYear) : undefined;
    const byResidence = req.query.byResidence === "true";
    let deathLocation: string | string[] | undefined = undefined;
    if (req.query.deathLocation) {
      if (Array.isArray(req.query.deathLocation)) {
        deathLocation = req.query.deathLocation as string[];
      } else {
        deathLocation = String(req.query.deathLocation);
      }
    }

    const matrix = await getCollisionMatrix(
      cityId,
      startYear,
      endYear,
      byResidence,
      deathLocation
    );

    res.json({
      matrix,
      metadata: {
        cityId,
        startYear,
        endYear,
        byResidence,
        deathLocation,
        locationType: byResidence
          ? "Local de Residência"
          : "Local de Ocorrência",
        description:
          "Matriz de colisão mostrando o número de mortes por tipo de vítima e contraparte",
      },
    });
  } catch (error) {
    console.error("Erro no endpoint matrix:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export default router;
