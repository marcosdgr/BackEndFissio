import { Router } from "express";
import { actualizarPlanObra, cambiarEstadoPlan, crearPlanObra, obtenerPlanesActivos, obtenerPlanesInactivos, obtenerPlanesObra, obtenerPlanObraPorId } from "../../Controllers/ObrasSociales/planObraSocial.controller.js";



const router = Router();
// Importo controladores


// Rutas
router.get ("/", obtenerPlanesObra);
router.get ("/:idPlanObra", obtenerPlanObraPorId);
router.post ("/", crearPlanObra);
router.put ("/:idPlanObra", actualizarPlanObra);
router.delete ("/cambiarestado/:idPlanObra", cambiarEstadoPlan);
router.get ("/activos", obtenerPlanesActivos);
router.get ("/inactivos", obtenerPlanesInactivos);

export default router;