import { Router } from "express";
import { borradoLogicoPlanPaciente, crearPlanPaciente, obtenerPlanesPaciente, obtenerPlanesPacienteActivos, obtenerPlanesPacienteInactivos, obtenerPlanesPacientePorId } from "../../Controllers/ObrasSociales/planObra_paciente.controller.js";

const router = Router();
// Importo controladores
// Rutas

router.get ("/", obtenerPlanesPaciente);
router.get ("/:idPlanObra", obtenerPlanesPacientePorId);
router.post ("/", crearPlanPaciente);
router.delete ("/:idPacienteObra", borradoLogicoPlanPaciente);
router.get ("/activos", obtenerPlanesPacienteActivos);
router.get ("/inactivos", obtenerPlanesPacienteInactivos);

export default router;