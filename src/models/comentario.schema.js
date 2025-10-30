import Joi from "joi";

export const crearComentarioSchema = Joi.object({
  CalificacionComentario: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      "number.base": "Calificación debe ser un número entero",
      "number.min": "La calificación debe ser al menos 1",
      "number.max": "La calificación no puede exceder 5",
      "any.required": "La calificación es requerida",
    }),

  Comentario: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "string.empty": "El comentario no puede estar vacío",
      "string.min": "El comentario debe tener al menos 1 carácter",
      "string.max": "El comentario no puede exceder 1000 caracteres",
      "any.required": "El comentario es requerido",
    }),

  idPaciente: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "ID de paciente debe ser un número entero",
      "number.min": "ID de paciente debe ser al menos 1",
      "any.required": "ID de paciente es requerido",
    }),
});

export const actualizarComentarioSchema = Joi.object({
  CalificacionComentario: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      "number.base": "Calificación debe ser un número entero",
      "number.min": "La calificación debe ser al menos 1",
      "number.max": "La calificación no puede exceder 5",
    }),

  Comentario: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      "string.empty": "El comentario no puede estar vacío",
      "string.min": "El comentario debe tener al menos 1 carácter",
      "string.max": "El comentario no puede exceder 100 caracteres",
    }),
});