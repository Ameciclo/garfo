import express, { Request, Response } from "express";
import { db } from "../../db"; // Ajuste o caminho conforme necessário
import * as schema from "../../db/migration/schema"; // Ajuste o caminho conforme necessário

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const relationsData = await getRelationsData();
    console.log("GET /cyclist-infra/relations: Data fetched successfully");
    res.json(relationsData);
  } catch (error) {
    console.error("GET /cyclist-infra/relations: Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

async function getRelationsData() {
  try {
    // Utilizando a API do Drizzle ORM para realizar a consulta
    const relations = await db
      .select()
      .from(schema.cyclist_infra_relations)
      .execute();

    return relations; // Ajuste conforme o formato de retorno desejado
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("An error occurred while fetching data.");
  }
}

export default router;
