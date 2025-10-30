import { Router } from "express";
import { obtenerEmpleados } from "../../Controllers/Empleados/empleados.controller";


const router = Router();


router.get("/", obtenerEmpleados);
router.get("/:idEmpleado", obtenerEmpleadoPorId);
router.post("/crearEmpleado", crearEmpleado);
router.put("/actualizarEmpleado/:idEmpleado", actualizarEmpleado);
router.delete("/borradoLogicoEmpleado/:idEmpleado", borradoLogicoEmpleado);

export default router;