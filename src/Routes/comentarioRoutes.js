import express from 'express';
import { traerComentariosActivos, traerComentarioPorId, crearComentario, actualizarComentario, borradoLogicoComentario } from '../controllers/comentarios.controller.js';
import { validarCrearComentario, validarActualizarComentario } from '../Middlewares/validation.js'; 

const router = express.Router();

router.get('/', traerComentariosActivos);  // Todos activos
router.get('/:id', traerComentarioPorId);  // Por ID
router.post('/', validarCrearComentario, crearComentario);  // Crear con validación
router.put('/:id', validarActualizarComentario, actualizarComentario);  // Actualizar con validación
router.delete('/:id', borradoLogicoComentario);  // Borrado lógico

export default router;