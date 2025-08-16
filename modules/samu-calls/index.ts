import express from "express";
import summaryRouter from "./summary";
import streetsRouter from "./streets";
import evolutionRouter from "./evolution";
import filtersRouter from "./filters";
import rankingRouter from "./ranking";
import citiesRouter from "./cities";

const router = express.Router();

router.use("/summary", summaryRouter);
router.use("/streets", streetsRouter);
router.use("/evolution", evolutionRouter);
router.use("/filters", filtersRouter);
router.use("/ranking", rankingRouter);
router.use("/cities", citiesRouter);

export default router;