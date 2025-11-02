import { crearMetricaDiariaSchema, actualizarMetricaDiariaSchema } from "../models/metricasDiarias.schema.js";

export const validarCrearMetrica = (req, res, next) => {
  const { error } = crearMetricaDiariaSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errores = error.details.map(d => ({ campo: d.path.join("."), mensaje: d.message }));
    return res.status(400).json({ message: "Errores de validación", errores });
  }
  next();
};

export const validarActualizarMetrica = (req, res, next) => {
  const { error } = actualizarMetricaDiariaSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errores = error.details.map(d => ({ campo: d.path.join("."), mensaje: d.message }));
    return res.status(400).json({ message: "Errores de validación", errores });
  }
  next();
};