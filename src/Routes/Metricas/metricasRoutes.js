import express from "express";
import { obtenerMetricasEnVivo } from "../../Controllers/Metricas/metricasEnVivo.controller.js";

const router = express.Router();

router.get("/vivo", obtenerMetricasEnVivo);      
router.get("/vivo/:fecha", obtenerMetricasEnVivo); 

export default router;