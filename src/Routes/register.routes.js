import { Router } from "express";
import { register } from "../Controllers/register.controller.js";

const router = Router();

// ruta para el registro
router.post("/register", register);

export default router;
