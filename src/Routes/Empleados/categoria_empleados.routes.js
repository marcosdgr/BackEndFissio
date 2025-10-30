import { Router } from "express";
import { actualizarCategoriaEmpleado, borradoLogicoCategoriaEmpleado, crearCategoriaEmpleado, obtenerCategoriaEmpleadoPorId, obtenerCategoriasEmpleados } from "../../Controllers/Empleados/categoria_empleados.controller.js";

const router = Router();

router.get("/", obtenerCategoriasEmpleados);
router.post("/crearCat", crearCategoriaEmpleado);
router.put("/actualizarCat/:idCatEmpleado", actualizarCategoriaEmpleado);
router.put("/borrarCat/:idCatEmpleado", borradoLogicoCategoriaEmpleado);
router.get("/obtenerCat/:idCatEmpleado", obtenerCategoriaEmpleadoPorId);

export default router;