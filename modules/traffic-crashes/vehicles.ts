// src/modules/traffic-crashes/vehicles.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import { cttu_crashes } from "../../db/modules/casualties/table_cttu_crashes";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sums = await db
      .select({
        auto: sql<number>`sum(${cttu_crashes.auto})`,
        moto: sql<number>`sum(${cttu_crashes.moto})`,
        ciclom: sql<number>`sum(${cttu_crashes.ciclom})`,
        ciclista: sql<number>`sum(${cttu_crashes.ciclista})`,
        pedestre: sql<number>`sum(${cttu_crashes.pedestre})`,
        onibus: sql<number>`sum(${cttu_crashes.onibus})`,
        caminhao: sql<number>`sum(${cttu_crashes.caminhao})`,
        viatura: sql<number>`sum(${cttu_crashes.viatura})`,
        outros: sql<number>`sum(${cttu_crashes.outros})`,
      })
      .from(cttu_crashes)
      .execute();

    const row = sums[0];
    res.json({
      auto: Number(row.auto),
      moto: Number(row.moto),
      ciclom: Number(row.ciclom),
      ciclista: Number(row.ciclista),
      pedestre: Number(row.pedestre),
      onibus: Number(row.onibus),
      caminhao: Number(row.caminhao),
      viatura: Number(row.viatura),
      outros: Number(row.outros),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
