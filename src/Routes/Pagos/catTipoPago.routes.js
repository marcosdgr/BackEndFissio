import { Router } from "express";

// Importaciones de los controladores
import { obtenerTiposPago,obtenerTipoPagoPorId, crearTipoPago, actualizarTipoPago,eliminarTipoPago } from "../../Controllers/Pagos/catTipoPago.controller.js";
const router = Router();

//Inicializo todas las rutas de pagos

//Metodo get
router.get ("/", obtenerTiposPago);
router.get("/:idTipoPago", obtenerTipoPagoPorId);

//Metodo post
router.post("/", crearTipoPago);

//Metodo put
router.put("/:idTipoPago", actualizarTipoPago);

//Metodo delete
router.delete("/:idTipoPago", eliminarTipoPago);

export default router;