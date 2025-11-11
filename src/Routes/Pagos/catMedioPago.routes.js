import { Router } from "express";
import { obtenerMediosPago, obtenerMedioPagoPorId, crearMedioPago, actualizarMedioPago, eliminarMedioPago } from "../../Controllers/Pagos/catMedioPago.controller.js";

const router = Router();

router.get("/", obtenerMediosPago);
router.get("/:idMedioPago", obtenerMedioPagoPorId);
router.post("/", crearMedioPago);
router.put("/:idMedioPago", actualizarMedioPago);
router.delete("/:idMedioPago", eliminarMedioPago);

export default router;