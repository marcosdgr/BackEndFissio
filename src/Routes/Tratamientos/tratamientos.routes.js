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
router.get("/estado/:estado", obtenerTratamientosPorEstado); // Cambiar :isActive a :estado
router.get("/nombre/:nombre", obtenerTratamientoPorNombre); // Cambiar :nombreTratamiento a :nombre y mover ANTES de :idTratamiento
router.get("/:idTratamiento", obtenerTratamientoPorId);

//Metodo post
router.post("/", crearTratamiento);

//Metodo put
router.put("/:idTratamiento", actualizarTratamiento);
router.put("/cambiarEstado/:idTratamiento", cambiarEstadoTratamiento);

export default router;