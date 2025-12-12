import { Router } from "express";

//Importaciones de los controladores
import {obtenerTodosLosTratamientos,
     obtenerTratamientosPorEstado, 
     obtenerTratamientoPorId, 
     obtenerTratamientoPorNombre, 
     crearTratamiento, 
     actualizarTratamiento, 
     cambiarEstadoTratamiento } from "../../Controllers/Tratamientos/tratamientos.controller.js";

const router = Router();

//Inicializo todas las rutas de tratamientos

//Metodo get
router.get("/", obtenerTodosLosTratamientos);
router.get("/estado/:estado", obtenerTratamientosPorEstado); 
router.get("/nombre/:nombre", obtenerTratamientoPorNombre); 
router.get("/:idTratamiento", obtenerTratamientoPorId);

//Metodo post
router.post("/", crearTratamiento);

//Metodo put
router.put("/:idTratamiento", actualizarTratamiento);
router.put("/cambiarEstado/:idTratamiento", cambiarEstadoTratamiento);

export default router;