import express from "express";
import {
  crearSala,
  traerSalasActivas,
  traerSalaPorId,
  actualizarSala,
  borradoLogicoSala,
} from "../controllers/salaController.js";
import {
  validarCrearSala,
  validarActualizarSala,
} from "../Middlewares/sala.validation.js";

const router = express.Router();

router.get("/", traerSalasActivas);
router.get("/:id", traerSalaPorId);
router.post("/", validarCrearSala, crearSala);
router.put("/:id", validarActualizarSala, actualizarSala);
router.delete("/:id", borradoLogicoSala);

export default router;