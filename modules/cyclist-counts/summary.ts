import express, { Request, Response } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import * as schema from "../../db/migration/schema";

const router = express.Router();

interface CountDetails {
  id: number;
  name: string;
  total_cyclists: number;
  date: Date;
  coordinates: string;
  slug: string;
}

interface CharacteristicsSummary {
    max_hour: number;
    total_cyclists: number;
    total_cargo: number;
    total_helmet: number;
    total_juveniles: number;
    total_motor: number;
    total_ride: number;
    total_service: number;
    total_shared_bike: number;
    total_sidewalk: number;
    total_women: number;
    total_wrong_way: number;
}

interface Summary {
  total_cyclists: number;
  characteristics: CharacteristicsSummary;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    // Realiza consulta para obter os detalhes de cada contagem
    const countsData: CountDetails[] =
      await db.query.cyclist_count_edition.findMany({
        // Ajuste a consulta conforme necessário
      });

    // Realiza consulta para obter as características agregadas de todas as contagens
    const characteristicsSummaryData: CharacteristicsSummary =
      await db.query.cyclist_count_characteristicsCount.findMany({
        // Ajuste a consulta conforme necessário
      });

    // Formata os dados de counts
    const counts = countsData.map((count) => ({
      id: count.id,
      name: count.name,
      coordinates: count.coordinates,
      total_cyclists: count.total_cyclists,
      date: count.date,
      slug: `${count.id}-${count.date.toISOString().slice(0, 10)}-${count.name
        .toLowerCase()
        .replace(/[\s\W]+/g, "-")}`,
    }));

    // Prepara o objeto summary
    const summary: Summary = {
      total_cyclists: countsData.reduce(
        (acc, count) => acc + count.total_cyclists,
        0
      ),
      characteristics: characteristicsSummaryData,
    };

    res.status(200).json({ summary, counts });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
