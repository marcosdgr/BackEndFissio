import Joi from "joi";

export const crearFaqSchema = Joi.object({
  Pregunta: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      "string.min": "Pregunta debe tener al menos 10 caracteres",
      "any.required": "Pregunta es obligatoria",
    }),
  Respuesta: Joi.string()
    .trim()
    .min(10)
    .required()
    .messages({
      "string.min": "Respuesta debe tener al menos 10 caracteres",
      "any.required": "Respuesta es obligatoria",
    }),
  Categoria: Joi.string()
    .max(100)
    .optional()
    .messages({
      "string.max": "Categoría no puede exceder 100 caracteres",
    }),
  idCatFAQ: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "idCatFAQ debe ser un número",
      "number.min": "idCatFAQ debe ser mayor a 0",
      "any.required": "idCatFAQ es requerido (elige una categoría)",
    }),
  // idFAQ NO se envía → NO validamos
});

export const actualizarFaqSchema = Joi.object({
  Pregunta: Joi.string().trim().min(10).max(500).optional(),
  Respuesta: Joi.string().trim().min(10).optional(),
  Categoria: Joi.string().max(100).optional(),
  idCatFAQ: Joi.number().integer().min(1).optional(),
  IsActive: Joi.number().valid(0, 1).optional(),
}).min(1);