 import { Router } from "express";

import { login } from "../Controllers/login.controller.js";

const router = Router();

// ruta para el login
router.post("/login", login);

export default router;