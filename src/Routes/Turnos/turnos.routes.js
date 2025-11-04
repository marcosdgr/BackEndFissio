import { Router } from 'express';
import { 
  solicitarTurno,
  asignarRecursosDelDia,
  listarTurnosDelDia,
  listarSolicitudesPendientes,
  obtenerKinesiologosDisponibles,
  obtenerSalasDisponibles,
  verificarDisponibilidadHorarios,
  finalizarTurno
} from '../../Controllers/Turnos/turnos.controller.js';
import { ejecutarRecordatoriosManual } from '../../Services/recordatorios.service.js';
import upload from '../../Middlewares/images.js';

const router = Router();

// Ruta para solicitar turno (Paciente)
router.post("/solicitar", upload.single("ordenMedica"), solicitarTurno);

// Rutas para gestión de turnos (Secretaria)
router.get("/turnos-del-dia", listarTurnosDelDia); // Para ver quién viene HOY
router.get("/solicitudes-pendientes", listarSolicitudesPendientes); // Historial
router.put("/asignar-recursos/:idTurno", asignarRecursosDelDia); // Cuando paciente llega
router.put("/finalizar/:idTurno", finalizarTurno); // Al terminar sesión

// Rutas de consulta para disponibilidad
router.get("/kinesiologos-disponibles", obtenerKinesiologosDisponibles);
router.get("/salas-disponibles", obtenerSalasDisponibles);
router.get("/disponibilidad-horarios/:fecha", verificarDisponibilidadHorarios);

// Ruta para ejecutar recordatorios manualmente 
router.post("/ejecutar-recordatorios", async (req, res) => {
  try {
    await ejecutarRecordatoriosManual();
    res.status(200).json({
      message: "Recordatorios ejecutados exitosamente",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error ejecutando recordatorios:", error);
    res.status(500).json({
      message: "Error al ejecutar recordatorios",
      error: error.message
    });
  }
});

export default router;