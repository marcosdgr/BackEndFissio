import express from "express";
import {
  crearMetricaDiaria,
  traerMetricasDiarias,
  traerMetricaPorFecha
} from "../controllers/metricasDiariasController.js";
import {
  validarCrearMetrica,
  validarActualizarMetrica
} from "../Middlewares/metricasDiarias.validation.js";

const router = express.Router();

router.get("/", traerMetricasDiarias);
router.get("/:fecha", traerMetricaPorFecha);
router.post("/", validarCrearMetrica, crearMetricaDiaria);

export default router;