import express from "express";
import summaryRouter from "./summary";
import streetsRouter from "./streets";
import evolutionRouter from "./evolution";
import filtersRouter from "./filters";
import filtrosRouter from "./filtros";
import rankingRouter from "./ranking";
import citiesRouter from "./cities";
import categoriesByCityYearRouter from "./categories-by-city-year";
import outcomesRouter from "./outcomes";
import outcomesCategoriesRouter from "./outcomes-categories";
import finalizationsRouter from "./finalizations";
import genderProfileRouter from "./gender-profile";
import ageProfileRouter from "./age-profile";
import categoriesRouter from "./categories";

const router = express.Router();

router.use("/summary", summaryRouter);
router.use("/streets", streetsRouter);
router.use("/evolution", evolutionRouter);
router.use("/filters", filtersRouter);
router.use("/filtros", filtrosRouter);
router.use("/ranking", rankingRouter);
router.use("/cities", citiesRouter);
router.use("/categories-by-city-year", categoriesByCityYearRouter);
router.use("/outcomes", outcomesRouter);
router.use("/outcomes-categories", outcomesCategoriesRouter);
router.use("/finalizations", finalizationsRouter);
router.use("/gender-profile", genderProfileRouter);
router.use("/age-profile", ageProfileRouter);
router.use("/categories", categoriesRouter);

export default router;