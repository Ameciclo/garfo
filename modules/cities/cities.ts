// cities.ts
import express from 'express';
import { db } from '../../db'; // Ajuste o caminho para seu arquivo db.ts

const router = express.Router();

// Rota GET para "cities"
router.get("/", async (req, res) => {
  try {
    const cities = await db.query.cities.findMany();

    console.log("GET /cities: Data fetched successfully");

    res.status(200).json(cities);
  } catch (error) {
    console.error("Error fetching cities data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;