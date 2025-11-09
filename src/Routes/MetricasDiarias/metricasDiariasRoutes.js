import express from "express";
import {
  crearMetricaDiaria,
  traerMetricasDiarias,
  traerMetricaPorFecha
} from "../../Controllers/Metricas/metricasDiarias.controller.js";
import {
  validarCrearMetrica,
  validarActualizarMetrica
} from "../../Middlewares/metricasDiarias.validation.js";

const router = express.Router();

router.get("/", traerMetricasDiarias);
router.get("/:fecha", traerMetricaPorFecha);
router.post("/", validarCrearMetrica, crearMetricaDiaria);

export default router;