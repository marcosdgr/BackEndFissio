import { Router } from "express";
import { actualizarEmpleado, borradoLogicoEmpleado, buscarEmpleadoPorDNI, buscarEmpleadosPorApellido, buscarEmpleadosPorNombre, crearEmpleado, obtenerEmpleadoPorId, obtenerEmpleados, obtenerEmpleadosActivos } from "../../Controllers/Empleados/empleados.controller.js";



const router = Router();


router.get("/", obtenerEmpleados);
router.get("/:idEmpleado", obtenerEmpleadoPorId);
router.get("/:DNI", buscarEmpleadoPorDNI);
router.get("/activos", obtenerEmpleadosActivos);
router.get("/nombres", buscarEmpleadosPorNombre);
router.get("/apellidos", buscarEmpleadosPorApellido);
router.post("/crearEmpleado", crearEmpleado);
router.put("/actualizarEmpleado/:idEmpleado", actualizarEmpleado);
router.delete("/borradoLogicoEmpleado/:idEmpleado", borradoLogicoEmpleado);

export default router;