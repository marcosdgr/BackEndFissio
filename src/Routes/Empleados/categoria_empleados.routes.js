import { Router } from "express";
import { obtenerCategoriasEmpleados } from "../../Controllers/Empleados/categoria_empleados.controller";

const router = Router();


router.get("/", obtenerCategoriasEmpleados);
router.get("/:idCatEmpleado", obtenerCategoriaEmpleadoPorId);
router.post("/crearCategoriaEmpleado", crearCategoriaEmpleado);
router.put("/actualizarCategoriaEmpleado/:idCatEmpleado", actualizarCategoriaEmpleado);
router.delete("/borradoLogicoCategoriaEmpleado/:idCatEmpleado", borradoLogicoCategoriaEmpleado);

export default router;