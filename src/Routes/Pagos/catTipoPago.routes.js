import { Router } from "express";
import { obtenerTiposPago, obtenerTipoPagoPorId, crearTipoPago, actualizarTipoPago, eliminarTipoPago } from "../../Controllers/Pagos/catTipoPago.controller.js";

const router = Router();

router.get("/", obtenerTiposPago);
router.get("/:idTipoPago", obtenerTipoPagoPorId);
router.post("/", crearTipoPago);
router.put("/:idTipoPago", actualizarTipoPago);
router.delete("/:idTipoPago", eliminarTipoPago);

export default router;