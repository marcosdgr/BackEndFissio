import { Router } from "express";
import { actualizarServicio, cambiarEstadoServicio, crearServicio, obtenerServicioPorId, obtenerServicios } from "../../Controllers/Servicios/servicios.controller.js";

const router = Router();


router.get('/servicios', obtenerServicios);
router.get('/servicios/:idServicio', obtenerServicioPorId);
router.post('/servicios', crearServicio);
router.put('/servicios/:idServicio', actualizarServicio);
router.put('/servicios/:idServicio/estado', cambiarEstadoServicio);

export default router;