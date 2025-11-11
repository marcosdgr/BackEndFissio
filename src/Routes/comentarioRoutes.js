import express from 'express';
import { traerComentariosActivos, traerComentarioPorId, crearComentario, actualizarComentario, borradoLogicoComentario } from '../Controllers/Comentarios/comentarios.controller.js';
import { validarCrearComentario, validarActualizarComentario } from '../Middlewares/validation.js'; 

const router = express.Router();

router.get('/', traerComentariosActivos);  // Todos activos
router.get('/:id', traerComentarioPorId);  // Por ID
router.post('/crear', validarCrearComentario, crearComentario);  // Crear con validación
router.put('/actualizar/:id', validarActualizarComentario, actualizarComentario);  // Actualizar con validación
router.put('/borrado-logico/:id', borradoLogicoComentario);  // Borrado lógico

export default router;