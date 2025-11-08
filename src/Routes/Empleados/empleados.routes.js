import { Router } from "express";
import { actualizarEmpleado, buscarEmpleadoPorDNI, buscarEmpleadosPorApellido, buscarEmpleadosPorNombre, cambiarEstadoEmpleado, crearEmpleado, obtenerEmpleadoPorId, obtenerEmpleados, obtenerEmpleadosActivos, obtenerEmpleadosInactivos } from "../../Controllers/Empleados/empleados.controller.js";



const router = Router();


router.get("/", obtenerEmpleados);
router.post("/crearEmpleado", crearEmpleado);
router.get("/activos", obtenerEmpleadosActivos);
router.get("/inactivos", obtenerEmpleadosInactivos);
router.get("/buscar/dni/:DNI", buscarEmpleadoPorDNI);
router.get("/buscar/nombre/:NombreEmpleado", buscarEmpleadosPorNombre);
router.get("/buscar/apellido/:ApellidoEmpleado", buscarEmpleadosPorApellido);

router.put("/actualizarEmpleado/:idEmpleado", actualizarEmpleado);
router.put("/cambiarestado/:idEmpleado", cambiarEstadoEmpleado);

router.get("/:idEmpleado", obtenerEmpleadoPorId);

export default router;