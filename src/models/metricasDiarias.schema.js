import Joi from "joi";

export const crearMetricaDiariaSchema = Joi.object({
  FechaBalance: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "FechaBalance debe ser YYYY-MM-DD",
      "any.required": "FechaBalance es requerida",
    }),

  IngresosCobrados: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "IngresosCobrados debe ser número",
  }),
  IngresosPendientes: Joi.number().precision(2).min(0).default(0),
  EgresosPagados: Joi.number().precision(2).min(0).default(0),
  EgresosPendientes: Joi.number().precision(2).min(0).default(0),

  TurnosProgramados: Joi.number().integer().min(0).default(0),
  TurnosAtendidos: Joi.number().integer().min(0).default(0),
  TurnosCancelados: Joi.number().integer().min(0).default(0),

  idTurno: Joi.number().integer().min(1).required().messages({
    "any.required": "idTurno es requerido",
    "number.min": "idTurno debe ser mayor a 0",
  }),
  idPago: Joi.number().integer().min(1).required(),
  idCobro: Joi.number().integer().min(1).required(),
});

export const actualizarMetricaDiariaSchema = Joi.object({
  IngresosCobrados: Joi.number().precision(2).min(0).optional(),
  IngresosPendientes: Joi.number().precision(2).min(0).optional(),
  EgresosPagados: Joi.number().precision(2).min(0).optional(),
  EgresosPendientes: Joi.number().precision(2).min(0).optional(),
  TurnosProgramados: Joi.number().integer().min(0).optional(),
  TurnosAtendidos: Joi.number().integer().min(0).optional(),
  TurnosCancelados: Joi.number().integer().min(0).optional(),
  idTurno: Joi.number().integer().min(1).optional(),
  idPago: Joi.number().integer().min(1).optional(),
  idCobro: Joi.number().integer().min(1).optional(),
}).min(1);