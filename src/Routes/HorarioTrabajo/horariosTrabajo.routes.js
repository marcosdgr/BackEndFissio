import { Router } from "express";
// Importaciones de los controladores
import {
  obtenerHorariosTrabajo,
  obtenerHorarioPorId,
  obtenerHorariosActivos,
  obtenerHorariosInactivos,
  crearHorarioTrabajo,
  actualizarHorarioTrabajo,
  borradoLogicoHorarioTrabajo,
  activacionLogicaHorarioTrabajo
} from "../../Controllers/HorariosTrabajo/horariosTrabajo.controller.js";

const router = Router();

//Rutas para horarios de trabajo

//Metodo get - RUTAS ESPECÍFICAS PRIMERO
router.get("/activos", obtenerHorariosActivos);
router.get("/inactivos", obtenerHorariosInactivos);
router.get("/", obtenerHorariosTrabajo);
router.get("/:idHorario", obtenerHorarioPorId);

//Metodo post
router.post("/", crearHorarioTrabajo);

//Metodo put - RUTAS ESPECÍFICAS PRIMERO
router.put("/:idHorario/desactivar", borradoLogicoHorarioTrabajo);
router.put("/:idHorario/activar", activacionLogicaHorarioTrabajo);
router.put("/:idHorario", actualizarHorarioTrabajo);

export default router;