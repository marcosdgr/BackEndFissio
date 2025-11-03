import {Router} from 'express';

//Importaciones de los controladores

import {obtenerCobros, obtenerCobroPorId, obtenerCobrosPorEstado,obtenerCobrosPorTurno, obtenerCobrosPorFecha, crearCobro, actualizarCobro, eliminarCobro} from "../../Controllers/Cobros/cobros.controller.js";

const router = Router();    

//Rutas para cobros

//Metodo get
router.get("/", obtenerCobros);
router.get("/estado/:estado", obtenerCobrosPorEstado);
router.get("/turno/:idTurno", obtenerCobrosPorTurno);
router.get("/fecha/:fecha", obtenerCobrosPorFecha);
router.get("/:idCobro", obtenerCobroPorId);

// Metodo post
router.post("/", crearCobro);

// Metodo put
router.put("/:idCobro", actualizarCobro);

// Metodo delete
router.delete("/:idCobro", eliminarCobro);  

export default router;