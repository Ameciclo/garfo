import express from "express";
import { db } from "../../db";
import { samu_calls, pcr_street_names } from "../../db/schema";
import { sql, eq, ilike, and, gte, lte } from "drizzle-orm";

const router = express.Router();

// Top 50 vias com mais sinistros
router.get("/top", async (req, res) => {
  try {
    const { limit = "50" } = req.query;

    const topStreets = await db
      .select({
        street_id: samu_calls.street_id,
        nome_oficial_logradouro: pcr_street_names.nome_oficial_logradouro,
        nomeBairro: pcr_street_names.nomeBairro,
        count: sql<number>`count(*)`,
        geom: pcr_street_names.geom
      })
      .from(samu_calls)
      .innerJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .groupBy(
        samu_calls.street_id,
        pcr_street_names.nome_oficial_logradouro,
        pcr_street_names.nomeBairro,
        pcr_street_names.geom
      )
      .orderBy(sql`count(*) desc`)
      .limit(parseInt(limit as string));

    res.json({
      topVias: topStreets,
      total: topStreets.length
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/top failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

// Buscar sinistros por via
router.get("/search", async (req, res) => {
  try {
    const { street, limit = "100" } = req.query;

    if (!street) {
      return res.status(400).json({ error: "Parâmetro 'street' é obrigatório" });
    }

    const results = await db
      .select({
        id: samu_calls.id,
        data: samu_calls.data,
        hora_minuto: samu_calls.hora_minuto,
        endereco: samu_calls.endereco,
        nome_oficial_logradouro: pcr_street_names.nome_oficial_logradouro,
        nomeBairro: pcr_street_names.nomeBairro,
        categoria: samu_calls.categoria,
        subtipo: samu_calls.subtipo,
        sexo: samu_calls.sexo,
        idade: samu_calls.idade,
        motivo_fin_cat: samu_calls.motivo_fin_cat,
        motivo_desf_cat: samu_calls.motivo_desf_cat,
        geom: pcr_street_names.geom
      })
      .from(samu_calls)
      .leftJoin(pcr_street_names, eq(samu_calls.street_id, pcr_street_names.id))
      .where(
        sql`${pcr_street_names.nome_oficial_logradouro} ILIKE ${`%${street}%`} OR ${samu_calls.endereco} ILIKE ${`%${street}%`}`
      )
      .orderBy(samu_calls.data)
      .limit(parseInt(limit as string));

    res.json({
      sinistros: results,
      total: results.length,
      busca: street
    });
  } catch (error: any) {
    console.error("GET /samu-calls/streets/search failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;