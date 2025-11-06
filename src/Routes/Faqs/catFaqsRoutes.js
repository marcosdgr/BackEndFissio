import express from "express";
import {
  crearCategoriaFaq,
  traerCategoriasActivas,
  actualizarCategoriaFaq
} from "../../Controllers/Faqs/catFaqs.controller.js";
import {
  validarCrearCategoria,
  validarActualizarCategoria
} from "../../Middlewares/catFaqs.validation.js";

const router = express.Router();

router.get("/", traerCategoriasActivas);
router.post("/", validarCrearCategoria, crearCategoriaFaq);
router.put("/:id", validarActualizarCategoria, actualizarCategoriaFaq);

export default router;