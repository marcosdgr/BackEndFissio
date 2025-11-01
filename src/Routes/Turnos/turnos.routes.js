import { Router } from 'express';
import { 
  solicitarTurno,
  procesarSolicitudTurno,
  listarSolicitudesPendientes,
  obtenerKinesiologosDisponibles,
  obtenerSalasDisponibles
} from '../../Controllers/Turnos/turnos.controllers.js';
import upload from '../../Middlewares/images.js';

const router = Router();

// Ruta para solicitar turno (Paciente)
router.post("/solicitar", upload.single("ordenMedica"), solicitarTurno);

// Rutas para gestión de turnos (Secretaria)
router.get("/solicitudes-pendientes", listarSolicitudesPendientes);
router.put("/procesar/:idTurno", procesarSolicitudTurno);

// Rutas de consulta para disponibilidad
router.get("/kinesiologos-disponibles", obtenerKinesiologosDisponibles);
router.get("/salas-disponibles", obtenerSalasDisponibles);

export default router;