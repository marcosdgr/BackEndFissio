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

//Metodo get 
router.get("/activos", obtenerHorariosActivos);
router.get("/inactivos", obtenerHorariosInactivos);
router.get("/", obtenerHorariosTrabajo);
router.get("/:idHorario", obtenerHorarioPorId);

//Metodo post
router.post("/", crearHorarioTrabajo);

//Metodo put -
router.put("/desactivar/:idHorario", borradoLogicoHorarioTrabajo);
router.put("/activar/:idHorario", activacionLogicaHorarioTrabajo);
router.put("/:idHorario", actualizarHorarioTrabajo);

export default router;
