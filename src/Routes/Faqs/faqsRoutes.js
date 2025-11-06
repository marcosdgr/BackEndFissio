import express from "express";
import {
  crearFaq,
  traerFaqsActivas,
  traerFaqPorId
} from "../../Controllers/Faqs/faqs.controller.js";
import {
  validarCrearFaq,
  validarActualizarFaq
} from "../../Middlewares/faqs.validation.js";

const router = express.Router();

router.get("/", traerFaqsActivas);
router.get("/:id", traerFaqPorId);
router.post("/", validarCrearFaq, crearFaq);

export default router;