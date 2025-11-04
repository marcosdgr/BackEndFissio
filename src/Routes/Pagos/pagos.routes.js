import { Router } from "express";

// Importaciones de los controladores

import { obtenerPagos,obtenerPagoPorId, crearPago, actualizarPago, eliminarPago } from "../../Controllers/Pagos/pagos.controller.js";
const router = Router();

//Inicializo todas las rutas de pagos

//Metodo get
router.get("/", obtenerPagos);
router.get("/:idPago", obtenerPagoPorId);

//Metodo post
router.post("/", crearPago);

//Metodo put
router.put("/:idPago", actualizarPago);

//Metodo delete
router.delete("/:idPago", eliminarPago);

export default router;
