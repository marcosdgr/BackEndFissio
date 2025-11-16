import { Router } from "express";

import { 
  login, 
  recuperarPassword, 
  cambioPassword 
} from "../../Controllers/Login/login.controller.js";

const router = Router();

// Ruta para el login
router.post("/login", login);

// Ruta para solicitar recuperación de contraseña
router.post("/recuperar-password", recuperarPassword);

// Ruta para cambiar la contraseña con el token
router.put("/cambio-password/:token", cambioPassword);

export default router;