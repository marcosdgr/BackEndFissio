import { Router } from "express";

// Importar controladores
import {
    obtenerTodasLasRelaciones,
    obtenerTratamientosPorTurno,
    obtenerTurnosPorTratamiento,
    asignarTratamientoATurno,
    asignarMultiplesTratamientos,
    eliminarTratamientoDeTurno,
    eliminarTodosTratamientosDeTurno,
    obtenerEstadisticasTratamientos
} from "../../Controllers/Tratamientos/turno_tratamiento.controller.js";

const router = Router();

//Inicializo todas las rutas de la relación turno-tratamiento

//Metodo get    
router.get("/", obtenerTodasLasRelaciones);
router.get("/tratamientos-por-turno/:idTurno", obtenerTratamientosPorTurno);
router.get("/turnos-por-tratamiento/:idTratamiento", obtenerTurnosPorTratamiento);
router.get("/estadisticas", obtenerEstadisticasTratamientos);

//Metodo post
router.post("/", asignarTratamientoATurno);
router.post("/asignar-multiples", asignarMultiplesTratamientos);

//Metodo delete
router.delete("/:idTurnoTratamiento", eliminarTratamientoDeTurno);
router.delete("/turno/:idTurno", eliminarTodosTratamientosDeTurno);

export default router;