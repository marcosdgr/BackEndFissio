import { Router } from "express";
import { register, traerUsuarios } from "../Controllers/usuarios.controller.js";

const router = Router();
// rutas GET
router.get("/", traerUsuarios);

// ruta para el registro
router.post("/register", register);

export default router;
