import { Router } from "express";


// Importaciones de los controladores
import { obtenerHorariosTrabajo, obtenerHorarioPorId, obtenerHorariosActivos, obtenerHorariosInactivos, crearHorarioTrabajo, actualizarHorarioTrabajo, borradoLogicoHorarioTrabajo, activacionLogicaHorarioTrabajo } from "../../Controllers/HorariosTrabajoController/horariosTrabajo.controller.js";

const router = Router();

//Inicializo todas las rutas de horarios de trabajo

//Metodo get
router.get("/",obtenerHorariosTrabajo );
router.get("/activos", obtenerHorariosActivos);
router.get("/inactivos", obtenerHorariosInactivos);
router.get("/:idHorario", obtenerHorarioPorId);

//Metodo post
router.post("/", crearHorarioTrabajo);

//Metodo put
router.put("/:idHorario", actualizarHorarioTrabajo);
router.put("/borradoLogico/:idHorario", borradoLogicoHorarioTrabajo);
router.put("/reactivar/:idHorario", activacionLogicaHorarioTrabajo);

export default router;