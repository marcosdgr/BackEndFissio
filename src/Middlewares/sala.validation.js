import { crearSalaSchema, actualizarSalaSchema } from "../models/sala.schema.js";

export const validarCrearSala = (req, res, next) => {
  const { error } = crearSalaSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errores = error.details.map((detail) => ({
      campo: detail.path.join("."),
      mensaje: detail.message,
    }));
    return res.status(400).json({
      message: "Errores de validación",
      errores,
    });
  }
  next();
};

export const validarActualizarSala = (req, res, next) => {
  const { error } = actualizarSalaSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errores = error.details.map((detail) => ({
      campo: detail.path.join("."),
      mensaje: detail.message,
    }));
    return res.status(400).json({
      message: "Errores de validación",
      errores,
    });
  }
  next();
};