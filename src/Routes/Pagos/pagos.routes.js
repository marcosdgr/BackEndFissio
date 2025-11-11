import { Router } from "express";
import { obtenerPagos, obtenerPagoPorId, crearPago, actualizarPago, eliminarPago } from "../../Controllers/Pagos/pagos.controller.js";

const router = Router();

router.get("/", obtenerPagos);
router.get("/:idPago", obtenerPagoPorId);
router.post("/", crearPago);
router.put("/:idPago", actualizarPago);
router.delete("/:idPago", eliminarPago);

export default router;