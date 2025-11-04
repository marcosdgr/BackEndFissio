
import { crearHistoriaClinicaSchema, actualizarHistoriaClinicaSchema } from "../models/historiaClinica.schema.js";

// Validar creación
export const validarCrearHistoriaClinica = (req, res, next) => {
  const { error } = crearHistoriaClinicaSchema.validate(req.body, { abortEarly: false });

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

// Validar actualización
export const validarActualizarHistoriaClinica = (req, res, next) => {
  const { error } = actualizarHistoriaClinicaSchema.validate(req.body, { abortEarly: false });

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