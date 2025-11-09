import { Router } from "express";
import { actualizarCategoriaEmpleado, actualizarEstadoCategoriaEmpleado, crearCategoriaEmpleado, obtenerCategoriaEmpleadoPorId, obtenerCategoriasEmpleados } from "../../Controllers/Empleados/categoria_empleados.controller.js";

const router = Router();

router.get("/", obtenerCategoriasEmpleados);
router.post("/crearCat", crearCategoriaEmpleado);
router.put("/actualizarCat/:idCatEmpleado", actualizarCategoriaEmpleado);
router.put("/cambiaractcat/:idCatEmpleado", actualizarEstadoCategoriaEmpleado);
router.get("/obtenerCat/:idCatEmpleado", obtenerCategoriaEmpleadoPorId);

export default router;