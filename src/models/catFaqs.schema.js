import Joi from "joi";

export const crearCategoriaFaqSchema = Joi.object({
  NombreCategoria: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Nombre de categoría es obligatorio",
      "string.min": "Mínimo 3 caracteres",
      "string.max": "Máximo 100 caracteres",
      "any.required": "NombreCategoria es requerido",
    }),
});

export const actualizarCategoriaFaqSchema = Joi.object({
  NombreCategoria: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional(),
  IsActive: Joi.number().valid(0, 1).optional(),
}).min(1);