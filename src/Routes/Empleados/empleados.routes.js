import { Router } from "express";
import { actualizarEmpleado, borradoLogicoEmpleado, buscarEmpleadoPorDNI, buscarEmpleadosPorApellido, buscarEmpleadosPorNombre, cambiarEstadoEmpleado, crearEmpleado, obtenerEmpleadoPorId, obtenerEmpleados, obtenerEmpleadosActivos, obtenerEmpleadosInactivos } from "../../Controllers/Empleados/empleados.controller.js";



const router = Router();

// Rutas específicas primero
router.get("/", obtenerEmpleados);
router.get("/activos", obtenerEmpleadosActivos);
router.get("/inactivos", obtenerEmpleadosInactivos);
router.get("/buscar/dni/:DNI", buscarEmpleadoPorDNI);
router.get("/buscar/nombre/:NombreEmpleado", buscarEmpleadosPorNombre);
router.get("/buscar/apellido/:ApellidoEmpleado", buscarEmpleadosPorApellido);
router.post("/", crearEmpleado);
router.put("/cambiar-estado/:idEmpleado", cambiarEstadoEmpleado);
router.put("/:idEmpleado", actualizarEmpleado);
// Ruta dinámica al final
router.get("/:idEmpleado", obtenerEmpleadoPorId);

export default router;