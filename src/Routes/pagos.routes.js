import { Router } from "express";

// Importaciones de los controladores

import { obtenerPagos,obtenerPagoPorId, obtenerPagosActivos, obtenerPagosInactivos, crearPago, actualizarPago, borradoLogicoPago } from "../Controllers/pagos.controller.js";
const router = Router();

//Inicializo todas las rutas de pagos

//Metodo get
router.get("/", obtenerPagos);
router.get("/activos", obtenerPagosActivos);
router.get("/inactivos", obtenerPagosInactivos);
router.get("/:idPago", obtenerPagoPorId);

//Metodo post
router.post("/", crearPago);

//Metodo put
router.put("/:idPago", actualizarPago);
router.put("/borradoLogico/:idPago", borradoLogicoPago);

export default router;
