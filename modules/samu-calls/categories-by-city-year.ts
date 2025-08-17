import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req: any, res: any) => {
  try {
    const { cidade, ano_inicio, ano_fim } = req.query;
    
    let whereConditions = [];
    
    if (cidade) {
      whereConditions.push(eq(samu_calls.municipio, cidade as string));
    }
    
    if (ano_inicio) {
      whereConditions.push(gte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, Number(ano_inicio)));
    }
    
    if (ano_fim) {
      whereConditions.push(lte(sql`EXTRACT(YEAR FROM ${samu_calls.data})`, Number(ano_fim)));
    }

    const result = await db
      .select({
        ano: sql<number>`EXTRACT(YEAR FROM ${samu_calls.data})`,
        acidente_moto: sql<number>`COUNT(CASE WHEN ${samu_calls.categoria} = 'Acidente de Moto' THEN 1 END)`,
        acidente_carro: sql<number>`COUNT(CASE WHEN ${samu_calls.categoria} = 'Acidente de Carro' THEN 1 END)`,
        atropelamento_carro: sql<number>`COUNT(CASE WHEN ${samu_calls.categoria} = 'Atropelamento por Carro' THEN 1 END)`,
        atropelamento_moto: sql<number>`COUNT(CASE WHEN ${samu_calls.categoria} = 'Atropelamento por Moto' THEN 1 END)`,
        outros: sql<number>`COUNT(CASE WHEN ${samu_calls.categoria} IN ('Acidente de Bicicleta', 'Acidente Ônibus/Caminhão', 'Atropelamento Ônibus/Caminhão', 'Atropelamento por Bicicleta', 'Outro') OR ${samu_calls.categoria} IS NULL THEN 1 END)`
      })
      .from(samu_calls)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${samu_calls.data})`);

    res.json(result);
  } catch (error: any) {
    console.error("GET /samu-calls/categories-by-city-year failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;