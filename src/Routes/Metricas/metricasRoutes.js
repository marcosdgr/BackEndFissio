import express from "express";
import { obtenerMetricasEnVivo } from "../../Controllers/Metricas/metricasEnVivo.controller.js";

const router = express.Router();

// MÉTRICAS 100% EN VIVO
router.get("/vivo", obtenerMetricasEnVivo);        // → /api/metricas/vivo
router.get("/vivo/:fecha", obtenerMetricasEnVivo); // → /api/metricas/vivo/2025-04-05

export default router;