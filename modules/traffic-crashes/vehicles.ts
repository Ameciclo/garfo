// src/modules/traffic-crashes/vehicles.ts
import express, { Request, Response } from "express";
import { db } from "../../db";
import * as schema from "../../db/schemas/traffic_casualties";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sums = await db
      .select({
        auto: sql<number>`sum(${schema.crashes.auto})`,
        moto: sql<number>`sum(${schema.crashes.moto})`,
        ciclom: sql<number>`sum(${schema.crashes.ciclom})`,
        ciclista: sql<number>`sum(${schema.crashes.ciclista})`,
        pedestre: sql<number>`sum(${schema.crashes.pedestre})`,
        onibus: sql<number>`sum(${schema.crashes.onibus})`,
        caminhao: sql<number>`sum(${schema.crashes.caminhao})`,
        viatura: sql<number>`sum(${schema.crashes.viatura})`,
        outros: sql<number>`sum(${schema.crashes.outros})`,
      })
      .from(schema.crashes)
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
