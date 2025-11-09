import { Router } from "express";
import { actualizarPlanObra, cambiarEstadoPlan, crearPlanObra, obtenerPlanesActivos, obtenerPlanesInactivos, obtenerPlanesObra, obtenerPlanObraPorId } from "../../Controllers/ObrasSociales/planObraSocial.controller.js";



const router = Router();
// Importo controladores


// Rutas (ordenadas por prioridad: rutas estáticas antes de las paramétricas)
router.get("/activos", obtenerPlanesActivos);
router.get("/inactivos", obtenerPlanesInactivos);
router.get("/", obtenerPlanesObra);
router.get("/:idPlanObra", obtenerPlanObraPorId);
router.post("/crearPlanObra", crearPlanObra);
router.put("/actualizarPlanObra/:idPlanObra", actualizarPlanObra);
router.put("/cambiarEstado/:idPlanObra", cambiarEstadoPlan);

export default router;