import { Router } from "express";
import {
  register,
  traerUsuarios,
  actualizarRolUsuario,
} from "../Controllers/usuarios.controller.js";

const router = Router();
// rutas GET
router.get("/", traerUsuarios);

// ruta para el registro
router.post("/register", register);

// ruta para actualizar rol de usuario - sera una ruta privada
router.put("/rol/:idUsuario", actualizarRolUsuario);
export default router;
