import { Router } from "express";
// Importaciones de los controladores
import {obtenerAsistencias,
     obtenerAsistenciaPorId, 
     obtenerAsistenciasPorEmpleado,
     obtenerAsistenciasPorFecha,
     obtenerAsistenciasPorRango,
     crearAsistencia,
     registrarEntrada,
     registrarSalida,
     actualizarAsistencia,
     eliminarAsistencia} from "../../Controllers/Asistencias/asistencias.controller.js";

const router = Router();

//Rutas para asistencias

//Metodo get
router.get("/", obtenerAsistencias);
router.get("/rangoFechas", obtenerAsistenciasPorRango);           
router.get("/empleado/:idEmpleado", obtenerAsistenciasPorEmpleado);  
router.get("/fecha/:fecha", obtenerAsistenciasPorFecha);
router.get("/:idAsistencia", obtenerAsistenciaPorId);            

// Metodo post
router.post("/", crearAsistencia);
router.post("/registrarEntrada", registrarEntrada);

// Metodo put
router.put("/registrarSalida/:idAsistencia", registrarSalida);
router.put("/:idAsistencia", actualizarAsistencia);

// Metodo delete
router.delete("/:idAsistencia", eliminarAsistencia);

export default router;