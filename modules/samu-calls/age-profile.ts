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

    // Get raw data and process in JavaScript
    const rawData = await db
      .select({
        idade: samu_calls.idade
      })
      .from(samu_calls)
      .where(and(
        sql`${samu_calls.idade} IS NOT NULL`,
        ...(whereConditions.length > 0 ? whereConditions : [])
      ));

    // Process age groups in JavaScript
    const ageGroups: Record<string, number> = {
      '0-17 anos': 0,
      '18-29 anos': 0,
      '30-49 anos': 0,
      '50-64 anos': 0,
      '65+ anos': 0,
      'Não informado': 0
    };

    rawData.forEach(row => {
      const idade = row.idade;
      if (!idade) {
        ageGroups['Não informado']++;
      } else if (idade < 18) {
        ageGroups['0-17 anos']++;
      } else if (idade >= 18 && idade <= 29) {
        ageGroups['18-29 anos']++;
      } else if (idade >= 30 && idade <= 49) {
        ageGroups['30-49 anos']++;
      } else if (idade >= 50 && idade <= 64) {
        ageGroups['50-64 anos']++;
      } else if (idade >= 65) {
        ageGroups['65+ anos']++;
      } else {
        ageGroups['Não informado']++;
      }
    });

    const result = Object.entries(ageGroups).map(([faixa_etaria, total]) => ({
      faixa_etaria,
      total
    }));

    const response = result.map((item: any) => ({
      faixa_etaria: item.faixa_etaria,
      total: item.total,
      percentual: total > 0 ? Number(((item.total / total) * 100).toFixed(1)) : 0
    }));

    res.json(response);
  } catch (error: any) {
    console.error("GET /samu-calls/age-profile failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;