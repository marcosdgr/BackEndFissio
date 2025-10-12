import { Router } from "express";
import {
  register,
  traerUsuarios,
  actualizarRolUsuario,
  borrarUsuario,
  activarUsuario,
} from "../Controllers/usuarios.controller.js";

const router = Router();
// rutas GET
router.get("/", traerUsuarios);

// ruta para el registro
router.post("/register", register);

// ruta para admin - seran rutas privadas
router.put("/rol/:idUsuario", actualizarRolUsuario);
router.put("/borrar/:idUsuario", borrarUsuario);
router.put("/activar/:idUsuario", activarUsuario);
export default router;
