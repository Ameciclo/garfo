import express from "express";
import { db } from "../../db";
import { samu_calls, cities } from "../../db/schema";
import { sql } from "drizzle-orm";

const router = express.Router();

// Listar cidades disponíveis nos dados do SAMU
router.get("/", async (req, res) => {
  try {
    const citiesWithData = await db
      .select({
        municipio_samu: samu_calls.municipio,
        count: sql<number>`count(*)`,
        id: cities.id,
        name: cities.name,
        rmr: cities.rmr
      })
      .from(samu_calls)
      .leftJoin(cities, sql`LOWER(${samu_calls.municipio}) = LOWER(${cities.name})`)
      .groupBy(samu_calls.municipio, cities.id, cities.name, cities.rmr)
      .orderBy(sql`count(*) desc`);

    res.json({
      cidades: citiesWithData,
      total: citiesWithData.length,
      recife_id: 2611606 // ID do Recife para facilitar o uso
    });
  } catch (error: any) {
    console.error("GET /samu-calls/cities failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;