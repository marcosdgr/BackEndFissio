import { Router } from "express";

// Importaciones de los controladores
import {obtenerMediosPago, obtenerMedioPagoPorId, crearMedioPago, actualizarMedioPago, eliminarMedioPago } from "../../Controllers/Pagos/catMedioPago.controller.js";
const router = Router();
//Inicializo todas las rutas de pagos

//Metodo get
router.get("/", obtenerMediosPago);
router.get("/:idMedioPago", obtenerMedioPagoPorId);

//Metodo post
router.post("/", crearMedioPago);

//Metodo put
router.put("/:idMedioPago", actualizarMedioPago);
//Metodo delete
router.delete("/:idMedioPago", eliminarMedioPago);

export default router;