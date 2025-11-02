import { crearCategoriaFaqSchema, actualizarCategoriaFaqSchema } from "../models/catFaqs.schema.js";

export const validarCrearCategoria = (req, res, next) => {
  const { error } = crearCategoriaFaqSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      error: error.details[0].message
    });
  }
  next();
};

export const validarActualizarCategoria = (req, res, next) => {
  const { error } = actualizarCategoriaFaqSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Error de validación",
      error: error.details[0].message
    });
  }
  next();
};