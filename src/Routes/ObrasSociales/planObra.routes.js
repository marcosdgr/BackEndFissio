import { Router } from "express";
import {  borradoLogicoPlanObra, crearPlanObra, obtenerPlanesActivos, obtenerPlanesInactivos, obtenerPlanesObra, obtenerPlanObraPorId } from "../../Controllers/ObrasSociales/planObra.controller.js";

const router = Router();
// Importo controladores


// Rutas
router.get ("/",obtenerPlanesObra);
router.get ("/:idPacienteObra",obtenerPlanObraPorId);
router.post ("/crearPlan",crearPlanObra);
router.put ("/eliminar/:idPacienteObra",borradoLogicoPlanObra);
router.get ("/activos",obtenerPlanesActivos);
router.get ("/inactivos",obtenerPlanesInactivos);

export default router;