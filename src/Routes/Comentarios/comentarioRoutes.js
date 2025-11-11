import { Router } from "express";
import {
  traerComentariosActivos,
  traerComentarioPorId,
  crearComentario,
  actualizarComentario,
  borradoLogicoComentario,
} from "../../Controllers/Comentarios/comentarios.controller.js";
import {
  validarCrearComentario,
  validarActualizarComentario,
} from "../../Middlewares/validation.js";
import {
  despublicarComentario,
  publicarComentario,
  traerComentariosPublicados,
} from "../../models/comentario.schema.js";

const router = Router();

router.get("/", traerComentariosActivos); // Todos activos
router.get("/:id", traerComentarioPorId); // Por ID
router.post("/crear", validarCrearComentario, crearComentario); // Crear con validación
router.put(
  "/actualizar/:id",
  validarActualizarComentario,
  actualizarComentario
); // Actualizar con validación
router.put("/borrado-logico/:id", borradoLogicoComentario); // Borrado lógico
router.get("/publicados", traerComentariosPublicados); // Comentarios publicados para HomePage
router.put("/publicar/:id", publicarComentario); // Publicar comentario
router.put("/despublicar/:id", despublicarComentario); // Despublicar comentario

export default router;
