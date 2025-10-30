import Joi from "joi";


// validaciones para crear una sala con joi 


export const crearSalaSchema = Joi.object({
  NombreSala: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .required()
    .messages({
      "string.empty": "El nombre de la sala no puede estar vacío",
      "string.min": "El nombre debe tener al menos 1 carácter",
      "string.max": "El nombre no puede exceder 20 caracteres",
      "any.required": "El nombre de la sala es requerido",
    }),

  Capacidad: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      "number.base": "La capacidad debe ser un número entero",
      "number.min": "La capacidad debe ser al menos 1",
      "number.max": "La capacidad no puede exceder 50",
      "any.required": "La capacidad es requerida",
    }),
});

export const actualizarSalaSchema = Joi.object({
  NombreSala: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .optional()
    .messages({
      "string.empty": "El nombre no puede estar vacío",
      "string.min": "El nombre debe tener al menos 1 carácter",
      "string.max": "El nombre no puede exceder 20 caracteres",
    }),

  Capacidad: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .messages({
      "number.base": "La capacidad debe ser un número entero",
      "number.min": "La capacidad debe ser al menos 1",
      "number.max": "La capacidad no puede exceder 50",
    }),
});