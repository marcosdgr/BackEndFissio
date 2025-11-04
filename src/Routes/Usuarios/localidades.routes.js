import { Router } from "express";
import {
  traerLocalidades
} from "../../Controllers/Usuarios/localidades.controller.js";

const router = Router();

// ruta GET para traer localidades
router.get("/", traerLocalidades);

export default router;