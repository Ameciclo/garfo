import express from "express";
import { db } from "../../db";
import { samu_calls } from "../../db/schema";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req: any, res: any) => {
  try {
    const result = await db
      .select({
        categoria: samu_calls.categoria,
        total: sql<number>`count(*)`
      })
      .from(samu_calls)
      .where(sql`${samu_calls.categoria} IS NOT NULL`)
      .groupBy(samu_calls.categoria)
      .orderBy(sql`count(*) desc`);

    res.json(result);
  } catch (error: any) {
    console.error("GET /samu-calls/categories failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;