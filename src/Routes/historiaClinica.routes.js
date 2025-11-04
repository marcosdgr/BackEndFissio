
import express from "express";
import {
  crearHistoriaClinica,
  traerHistoriasClinicasActivas,
  traerHistoriaClinicaPorId,
  actualizarHistoriaClinica,
  borradoLogicoHistoriaClinica,
} from "../Controllers/Pacientes/historiaClinica.controller.js";
import {
  validarCrearHistoriaClinica,
  validarActualizarHistoriaClinica,
} from "../Middlewares/historiaClinica.validation.js";

const router = express.Router();

router.get("/", traerHistoriasClinicasActivas);
router.get("/:id", traerHistoriaClinicaPorId);
router.post("/", validarCrearHistoriaClinica, crearHistoriaClinica);
router.put("/:id", validarActualizarHistoriaClinica, actualizarHistoriaClinica);
router.delete("/:id", borradoLogicoHistoriaClinica);

export default router;