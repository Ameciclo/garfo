import express from "express";
import { config } from "./config";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json({
      desfechos_validos: config.desfechos.validos,
      desfechos_invalidos: config.desfechos.invalidos,
      observacao: "Por padrão, os endpoints retornam apenas dados com desfechos válidos. Use o parâmetro 'incluir_invalidos=true' para incluir todos os desfechos."
    });
  } catch (error: any) {
    console.error("GET /samu-calls/outcomes-categories failed:", error);
    res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

export default router;