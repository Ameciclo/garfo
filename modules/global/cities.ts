// modules/cities/cities.ts
import express from "express";
import { db } from "../../db";
import * as schema from "../../db/schema";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cities = await db.select().from(schema.cities).execute();
    res.status(200).json(cities);
  } catch (error: any) {
    console.error("GET /cities failed:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;
