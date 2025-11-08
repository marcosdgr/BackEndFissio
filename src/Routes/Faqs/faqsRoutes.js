// Routes/Faqs/faqsRoutes.js
import express from "express";
import {
  crearFaq,
  traerFaqsActivas,
  traerFaqPorId,
  actualizarFaq,
  cambiarEstadoFaq
} from "../../Controllers/Faqs/faqs.controller.js";
import {
  validarCrearFaq,
  validarActualizarFaq
} from "../../Middlewares/faqs.validation.js";

const router = express.Router();

router.get("/", traerFaqsActivas);
router.get("/:id", traerFaqPorId);
router.post("/", validarCrearFaq, crearFaq);
router.put("/:id", validarActualizarFaq, actualizarFaq);           // NUEVO
router.put("/cambiarEstado/:id", cambiarEstadoFaq);               // NUEVO

export default router;