import { crearFaqSchema, actualizarFaqSchema } from "../models/faqs.schema.js";

export const validarCrearFaq = (req, res, next) => {
  const { error } = crearFaqSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      error: error.details[0].message
    });
  }
  next();
};

export const validarActualizarFaq = (req, res, next) => {
  const { error } = actualizarFaqSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      error: error.details[0].message
    });
  }
  next();
};