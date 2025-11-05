import { Router } from "express";

// importaciones de controllers
import {
  actualizarPaciente,
  cambiarEstadoPaciente,
  traerPacientes,
} from "../../Controllers/Pacientes/pacientes.controller.js";

const router = Router();

// ruta GET para traer todos los pacientes
router.get("/", traerPacientes);

// ruta PUT para actualizar datos del paciente
router.put("/actualizar/:idPaciente", actualizarPaciente);
router.put("/estado/:idPaciente", cambiarEstadoPaciente);

export default router;
