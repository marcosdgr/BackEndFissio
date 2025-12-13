import { Router } from "express";

// importaciones de controllers
import {
  actualizarPaciente,
  cambiarEstadoPaciente,
  crearPaciente,
  traerPacientes,
  traerLocalidades,
  obtenerPacientePorId,
  obtenerTurnosPorIdPaciente,
  obtenerDetallesTurno,
  obtenerMailPacientePorId,
  cancelarTurnoPaciente,
  obtenerComentariosPaciente
} from "../../Controllers/Pacientes/pacientes.controller.js";

const router = Router();

// Rutas específicas primero 
router.get("/", traerPacientes);
router.get("/localidades", traerLocalidades);

// Rutas 
router.get("/:idPaciente/turnos/detalles", obtenerDetallesTurno);
router.get("/:idPaciente/mail", obtenerMailPacientePorId);
router.get("/:idPaciente/turnos", obtenerTurnosPorIdPaciente);
router.get("/:idPaciente/comentarios", obtenerComentariosPaciente);
router.get("/:idPaciente", obtenerPacientePorId);

// ruta POST para crear nuevo paciente
router.post("/", crearPaciente);

// ruta PUT para actualizar datos del paciente
router.put("/actualizar/:idPaciente", actualizarPaciente);
router.put("/:idPaciente/turnos/:idTurno/cancelar", cancelarTurnoPaciente);
router.put("/estado/:idPaciente", cambiarEstadoPaciente);

export default router;
