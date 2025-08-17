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
        'colisao': 'Colisão',
        'atropelamento': 'Atropelamento', 
        'capotamento': 'Capotamento',
        'outros': 'Outros'
      };
      
      if (modo === 'outros') {
        whereConditions.push(sql`(${samu_calls.categoria} NOT IN ('Colisão', 'Atropelamento', 'Capotamento') OR ${samu_calls.categoria} IS NULL)`);
      } else {
        whereConditions.push(eq(samu_calls.categoria, modoMap[modo as string]));
      }
    }

    const totalQuery = await db
      .select({ total: sql<number>`count(*)` })
      .from(samu_calls)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = totalQuery[0].total;

    const result = await db
      .select({
        finalizacao: samu_calls.motivo_fin_cat,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(and(
        sql`${samu_calls.motivo_fin_cat} IS NOT NULL`,
        ...(whereConditions.length > 0 ? whereConditions : [])
      ))
      .groupBy(samu_calls.motivo_fin_cat)
      .orderBy(sql`count(*) desc`);

    const response = result.map((item: any) => ({
      finalizacao: item.finalizacao,
      total: item.total,
      percentual: total > 0 ? Number(((item.total / total) * 100).toFixed(1)) : 0
    }));

    res.json(response);
  } catch (error: any) {
    console.error("GET /samu-calls/finalizations failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;