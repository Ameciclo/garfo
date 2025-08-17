import express from "express";
import { db } from "../../db";
import { samu_calls } from "../../db/schema";
import { sql, eq, and } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req: any, res: any) => {
  try {
    const { cidade, modo } = req.query;
    
    let whereConditions = [];
    
    if (cidade) {
      whereConditions.push(eq(samu_calls.municipio, cidade as string));
    }
    
    if (modo) {
      const modoMap: Record<string, string> = {
        'acidente-moto': 'Acidente de Moto',
        'acidente-carro': 'Acidente de Carro',
        'acidente-bicicleta': 'Acidente de Bicicleta',
        'atropelamento-carro': 'Atropelamento por Carro',
        'atropelamento-moto': 'Atropelamento por Moto',
        'acidente-onibus-caminhao': 'Acidente Ônibus/Caminhão',
        'atropelamento-onibus-caminhao': 'Atropelamento Ônibus/Caminhão',
        'atropelamento-bicicleta': 'Atropelamento por Bicicleta',
        'outro': 'Outro'
      };
      
      whereConditions.push(eq(samu_calls.categoria, modoMap[modo as string]));
    }

    const totalQuery = await db
      .select({ total: sql<number>`count(*)` })
      .from(samu_calls)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = totalQuery[0].total;

    const result = await db
      .select({
        sexo: samu_calls.sexo,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(
        sql`${samu_calls.sexo} IS NOT NULL`,
        ...(whereConditions.length > 0 ? whereConditions : [])
      ))
      .groupBy(samu_calls.sexo)
      .orderBy(sql`count(*) desc`);

    const sexoMap: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Feminino'
    };

    const response = result.map((item: any) => ({
      sexo: sexoMap[item.sexo] || item.sexo,
      total: item.total,
      percentual: total > 0 ? Number(((item.total / total) * 100).toFixed(1)) : 0
    }));

    res.json(response);
  } catch (error: any) {
    console.error("GET /samu-calls/gender-profile failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;