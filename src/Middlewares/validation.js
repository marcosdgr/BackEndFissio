import { crearComentarioSchema } from "../models/comentario.schema.js"; 
import { actualizarComentarioSchema } from "../models/comentario.schema.js";

// Middleware para validar datos al crear un comentario
export const validarCrearComentario = (req, res, next) => {
  const { error } = crearComentarioSchema.validate(req.body);

  if (error) {
    const errores = error.details.map((detail) => ({
      campo: detail.path[0],
      mensaje: detail.message,
    }));

    return res.status(400).json({
      message: "Errores de validación",
      errores,
    });
  }

  next();
};

// Middleware para validar datos al actualizar un comentario
export const validarActualizarComentario = (req, res, next) => {
  const { error } = actualizarComentarioSchema.validate(req.body);

  if (error) {
    const errores = error.details.map((detail) => ({
      campo: detail.path[0],
      mensaje: detail.message,
    }));

    return res.status(400).json({
      message: "Errores de validación",
      errores,
    });
  }

  next();
};