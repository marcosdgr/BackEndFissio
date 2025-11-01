import { Router } from "express";
import { actualizarTurnoServicio, crearTurnoServicio, eliminarTurnoServicio, obtenerServiciosPorTurno, obtenerTurnoServicioPorId, obtenerTurnosServicios } from "../../Controllers/Servicios/turnos_servicios.controller.js";

const router = Router();

// Rutas
router.get('/', obtenerTurnosServicios);
router.get('/:idTurnoServicio', obtenerTurnoServicioPorId);
router.get('/turno/:idTurno', obtenerServiciosPorTurno);
router.post('/crear', crearTurnoServicio);
router.put ('/actualizar/:idTurnoServicio', actualizarTurnoServicio);
router.delete('/eliminar/:idTurnoServicio', eliminarTurnoServicio);


export default router;