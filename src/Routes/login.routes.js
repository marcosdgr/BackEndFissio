import { Router } from "express";
import { login } from "../Controllers/Login/login.controller.js";
import { autenticar } from "../Middlewares/mensajeriaInterna/autenticar.js";

const router = Router();

// Ruta pública - Login (genera token JWT)
router.post("/login", login);

// Rutas protegidas - requieren token
router.get("/verificar", autenticar, (req, res) => {
  // Si llegó aquí, el token es válido
  res.status(200).json({
    message: "Token válido",
    usuario: req.usuarioAutenticado
  });
});

router.post("/logout", autenticar, (req, res) => {
  // En JWT el logout se maneja en el cliente eliminando el token
  res.status(200).json({
    message: "Logout exitoso. Elimina el token del cliente"
  });
});

export default router;