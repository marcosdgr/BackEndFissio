import { Router } from "express";
import { actualizarPlanObra, borradoLogicoPlanObra, crearPlanObra, obtenerPlanesObra, obtenerPlanObraPorId } from "../../Controllers/ObrasSociales/planObra.controller.js";

const router = Router();
// Importo controladores


// Rutas
router.get ("/",obtenerPlanesObra);
router.get ("/:idPacienteObra",obtenerPlanObraPorId);
router.post ("/",crearPlanObra);
router.put ("/:idPacienteObra",actualizarPlanObra);
router.put ("/eliminar/:idPacienteObra",borradoLogicoPlanObra);

export default router;