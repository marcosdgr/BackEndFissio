import { Router } from "express";
import {
  register,
  traerUsuarios,
  actualizarRolUsuario,
  cambiarEstadoUsuario,
  
} from "../Controllers/Usuarios/usuarios.controller.js";

const router = Router();

// rutas GET
router.get("/", traerUsuarios);

// ruta para el registro
router.post("/register", register);

// ruta para admin - seran rutas privadas
router.put("/rol/:idUsuario", actualizarRolUsuario);
router.put("/estado/:idUsuario", cambiarEstadoUsuario);

export default router;