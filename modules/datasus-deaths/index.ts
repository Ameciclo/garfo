// modules/datasus-deaths/index.ts
import express from "express";
import summaryRouter from "./summary";
import citiesByYearRouter from "./cities-by-year";

const router = express.Router();

router.use("/summary", summaryRouter);
router.use("/cities-by-year", citiesByYearRouter);

export default router;