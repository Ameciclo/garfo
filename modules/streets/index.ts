import express from "express";
import summaryRouter from "./summary";

const router = express.Router();

router.use("/summary", summaryRouter);

export default router;