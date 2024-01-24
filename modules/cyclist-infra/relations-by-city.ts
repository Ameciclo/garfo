import express, { Request, Response } from "express";
import { db } from "../../db";
import * as schema from "../../db/migration/schema";

const router = express.Router();

async function getWaysData() {
  try {
    const ways = await db.select().from(schema.cyclist_infra_ways).execute();
    return ways;
  } catch (error) {
    console.error("Error fetching ways data:", error);
    throw new Error("An error occurred while fetching ways data.");
  }
}

async function getCitiesData() {
  try {
    const citiesData = await db
      .select()
      .from(schema.cities)
      .join(cyclist_infra_relations)
      .on(/* condição do join */)
      .execute();
    return citiesData;
  } catch (error) {
    console.error("Error fetching cities data:", error);
    throw new Error("An error occurred while fetching cities data.");
  }
}

async function getRelationsData() {
  try {
    const relations = await db
      .select()
      .from(schema.cyclist_infra_relations)
      .execute();
    return relations;
  } catch (error) {
    console.error("Error fetching relations data:", error);
    throw new Error("An error occurred while fetching relations data.");
  }
}

export default router;
