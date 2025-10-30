// models/historiaClinica.schema.js
import Joi from "joi";

export const crearHistoriaClinicaSchema = Joi.object({
  FechaInicio: Joi.date()
    .required()
    .messages({
      "any.required": "FechaInicio es requerida",
      "date.base": "FechaInicio debe ser una fecha válida (YYYY-MM-DD HH:mm:ss)",
    }),

  Diagnostico: Joi.string()
    .trim()
    .max(20)
    .allow(null, "")
    .optional()
    .messages({
      "string.max": "Diagnostico no puede exceder 20 caracteres",
      "string.base": "Diagnostico debe ser texto",
    }),

  Observaciones: Joi.string()
    .trim()
    .max(100)
    .allow(null, "")
    .optional()
    .messages({
      "string.max": "Observaciones no puede exceder 100 caracteres",
      "string.base": "Observaciones debe ser texto",
    }),

  FechaActualizacion: Joi.date()
    .required()
    .messages({
      "any.required": "FechaActualizacion es requerida",
      "date.base": "FechaActualizacion debe ser una fecha válida",
    }),

  CreadoPor: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "CreadoPor es requerido",
      "number.base": "CreadoPor debe ser un número entero",
      "number.min": "CreadoPor debe ser al menos 1",
      "number.integer": "CreadoPor debe ser entero",
    }),

  ActualizadoPor: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "ActualizadoPor es requerido",
      "number.base": "ActualizadoPor debe ser un número entero",
      "number.min": "ActualizadoPor debe ser al menos 1",
      "number.integer": "ActualizadoPor debe ser entero",
    }),

  idPaciente: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "idPaciente es requerido",
      "number.base": "idPaciente debe ser un número entero",
      "number.min": "idPaciente debe ser al menos 1",
      "number.integer": "idPaciente debe ser entero",
    }),
});

export const actualizarHistoriaClinicaSchema = Joi.object({
  Diagnostico: Joi.string()
    .trim()
    .max(20)
    .allow(null, "")
    .optional()
    .messages({
      "string.max": "Diagnostico no puede exceder 20 caracteres",
      "string.base": "Diagnostico debe ser texto",
    }),

  Observaciones: Joi.string()
    .trim()
    .max(100)
    .allow(null, "")
    .optional()
    .messages({
      "string.max": "Observaciones no puede exceder 100 caracteres",
      "string.base": "Observaciones debe ser texto",
    }),

  FechaActualizacion: Joi.date()
    .required()
    .messages({
      "any.required": "FechaActualizacion es requerida",
      "date.base": "FechaActualizacion debe ser una fecha válida",
    }),

  ActualizadoPor: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "any.required": "ActualizadoPor es requerido",
      "number.base": "ActualizadoPor debe ser un número entero",
      "number.min": "ActualizadoPor debe ser al menos 1",
      "number.integer": "ActualizadoPor debe ser entero",
    }),
});