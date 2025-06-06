// modules/datasus-deaths/index.ts
import express from "express";
import summaryRouter from "./summary";
import citiesByYearRouter from "./cities-by-year";
import filtrosRouter from "./filtros";
import matrixRouter from "./matrix";

const router = express.Router();

router.use("/summary", summaryRouter);
router.use("/cities-by-year", citiesByYearRouter);
router.use("/filtros", filtrosRouter);
router.use("/matrix", matrixRouter);

export default router;