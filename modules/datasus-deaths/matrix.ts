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
  // Pedestres (V01-V09)
  "V01": "pedestre", "V02": "pedestre", "V03": "pedestre", "V04": "pedestre",
  "V05": "pedestre", "V06": "pedestre", "V09": "pedestre",
  
  // Ciclistas (V10-V19)
  "V10": "ciclista", "V11": "ciclista", "V12": "ciclista", "V13": "ciclista",
  "V14": "ciclista", "V15": "ciclista", "V16": "ciclista", "V17": "ciclista",
  "V18": "ciclista", "V19": "ciclista",
  
  // Motociclistas (V20-V29)
  "V20": "motociclista", "V21": "motociclista", "V22": "motociclista", "V23": "motociclista",
  "V24": "motociclista", "V25": "motociclista", "V26": "motociclista", "V27": "motociclista",
  "V28": "motociclista", "V29": "motociclista",
  
  // Ocupantes de automóveis (V40-V49)
  "V40": "ocupante_automovel", "V41": "ocupante_automovel", "V42": "ocupante_automovel", 
  "V43": "ocupante_automovel", "V44": "ocupante_automovel", "V45": "ocupante_automovel", 
  "V46": "ocupante_automovel", "V47": "ocupante_automovel", "V48": "ocupante_automovel", 
  "V49": "ocupante_automovel",
  
  // Ocupantes de veículos pesados (V50-V59)
  "V50": "ocupante_veiculo_pesado", "V51": "ocupante_veiculo_pesado", "V52": "ocupante_veiculo_pesado",
  "V53": "ocupante_veiculo_pesado", "V54": "ocupante_veiculo_pesado", "V55": "ocupante_veiculo_pesado",
  "V56": "ocupante_veiculo_pesado", "V57": "ocupante_veiculo_pesado", "V58": "ocupante_veiculo_pesado",
  "V59": "ocupante_veiculo_pesado",
  
  // Ocupantes de ônibus (V70-V79)
  "V70": "ocupante_onibus", "V71": "ocupante_onibus", "V72": "ocupante_onibus", "V73": "ocupante_onibus",
  "V74": "ocupante_onibus", "V75": "ocupante_onibus", "V76": "ocupante_onibus", "V77": "ocupante_onibus",
  "V78": "ocupante_onibus", "V79": "ocupante_onibus",
};

// Mapeamento de códigos CID para contrapartes
const counterpartMap: Record<string, string> = {
  // Contrapartes para pedestres (V01-V09)
  "V01": "ciclista",                // Pedestre x Veículo a pedal
  "V02": "motociclista",            // Pedestre x Veículo a motor de duas ou três rodas
  "V03": "automovel",               // Pedestre x Automóvel
  "V04": "veiculo_pesado_onibus",   // Pedestre x Veículo pesado ou ônibus
  "V05": "trem",                    // Pedestre x Trem
  "V06": "outro_nao_motorizado",    // Pedestre x Outro veículo não-motorizado
  "V09": "nao_especificado",        // Pedestre x Não especificado
  
  // Contrapartes para ciclistas (V10-V19)
  "V10": "pedestre",                // Ciclista x Pedestre
  "V11": "ciclista",                // Ciclista x Outro ciclista
  "V12": "motociclista",            // Ciclista x Veículo a motor de duas ou três rodas
  "V13": "automovel",               // Ciclista x Automóvel
  "V14": "veiculo_pesado_onibus",   // Ciclista x Veículo pesado ou ônibus
  "V15": "trem",                    // Ciclista x Trem
  "V16": "outro_nao_motorizado",    // Ciclista x Outro veículo não-motorizado
  "V17": "objeto_fixo",             // Ciclista x Objeto fixo
  "V18": "sem_colisao",             // Ciclista x Sem colisão
  "V19": "nao_especificado",        // Ciclista x Não especificado
  
  // Contrapartes para motociclistas (V20-V29) - seguindo o mesmo padrão
  "V20": "pedestre",                // Motociclista x Pedestre
  "V21": "ciclista",                // Motociclista x Ciclista
  "V22": "motociclista",            // Motociclista x Outro motociclista
  "V23": "automovel",               // Motociclista x Automóvel
  "V24": "veiculo_pesado_onibus",   // Motociclista x Veículo pesado ou ônibus
  "V25": "trem",                    // Motociclista x Trem
  "V26": "outro_nao_motorizado",    // Motociclista x Outro veículo não-motorizado
  "V27": "objeto_fixo",             // Motociclista x Objeto fixo
  "V28": "sem_colisao",             // Motociclista x Sem colisão
  "V29": "nao_especificado",        // Motociclista x Não especificado
  
  // Contrapartes para ocupantes de automóveis (V40-V49)
  "V40": "pedestre",                // Automóvel x Pedestre
  "V41": "ciclista",                // Automóvel x Ciclista
  "V42": "motociclista",            // Automóvel x Motociclista
  "V43": "automovel",               // Automóvel x Outro automóvel
  "V44": "veiculo_pesado_onibus",   // Automóvel x Veículo pesado ou ônibus
  "V45": "trem",                    // Automóvel x Trem
  "V46": "outro_nao_motorizado",    // Automóvel x Outro veículo não-motorizado
  "V47": "objeto_fixo",             // Automóvel x Objeto fixo
  "V48": "sem_colisao",             // Automóvel x Sem colisão
  "V49": "nao_especificado",        // Automóvel x Não especificado
};

// Função para obter a matriz de colisão para uma cidade ou RMR
async function getCollisionMatrix(cityId?: number, startYear?: number, endYear?: number, byResidence: boolean = false) {
  try {
    // Definir período padrão se não especificado
    const currentYear = new Date().getFullYear();
    const defaultStartYear = currentYear - config.periodos.anosRetroativos;
    
    // Usar valores padrão se não fornecidos
    const fromYear = startYear || defaultStartYear;
    const toYear = endYear || currentYear;
    
    // Determinar qual campo usar com base no parâmetro byResidence
    const locationField = byResidence ? datasus_deaths.codmunres : datasus_deaths.codmunocor;
    
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
    
    // Buscar os dados de mortes por CID
    const deathsByCID = await db
      .select({
        causabas: datasus_deaths.causabas,
        count: sql<number>`count(*)`
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
      veiculo_pesado_onibus: number;
      trem: number;
      outro_nao_motorizado: number;
      objeto_fixo: number;
      sem_colisao: number;
      nao_especificado: number;
      total: number;
    };
    
    type CollisionMatrixType = {
      pedestre: CounterpartType;
      ciclista: CounterpartType;
      motociclista: CounterpartType;
      ocupante_automovel: CounterpartType;
      ocupante_veiculo_pesado: CounterpartType;
      ocupante_onibus: CounterpartType;
      total: CounterpartType;
    };
    
    // Inicializar a matriz de colisão
    const collisionMatrix: CollisionMatrixType = {
      pedestre: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      ciclista: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      motociclista: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      ocupante_automovel: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      ocupante_veiculo_pesado: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      ocupante_onibus: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      },
      total: {
        pedestre: 0,
        ciclista: 0,
        motociclista: 0,
        automovel: 0,
        veiculo_pesado_onibus: 0,
        trem: 0,
        outro_nao_motorizado: 0,
        objeto_fixo: 0,
        sem_colisao: 0,
        nao_especificado: 0,
        total: 0
      }
    };
    
    // Preencher a matriz com os dados
    for (const death of deathsByCID) {
      const cid = death.causabas?.substring(0, 3);
      if (!cid) continue;
      
      const victimType = victimTypeMap[cid];
      const counterpartType = counterpartMap[cid];
      
      if (victimType && counterpartType && collisionMatrix[victimType as keyof typeof collisionMatrix]) {
        const count = Number(death.count) || 0;
        const victim = victimType as keyof typeof collisionMatrix;
        const counterpart = counterpartType as keyof typeof collisionMatrix.pedestre;
        
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
    const startYear = req.query.startYear ? Number(req.query.startYear) : undefined;
    const endYear = req.query.endYear ? Number(req.query.endYear) : undefined;
    const byResidence = req.query.byResidence === 'true';
    
    const matrix = await getCollisionMatrix(cityId, startYear, endYear, byResidence);
    
    res.json({
      matrix,
      metadata: {
        cityId,
        startYear,
        endYear,
        byResidence,
        locationType: byResidence ? "Local de Residência" : "Local de Ocorrência",
        description: "Matriz de colisão mostrando o número de mortes por tipo de vítima e contraparte"
      }
    });
  } catch (error) {
    console.error("Erro no endpoint matrix:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    });
  }
});

export default router;