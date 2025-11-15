import { Router } from "express";
// Importaciones de los controladores
import{obtenerEmpleadosHorarios,
     obtenerHorariosActivosPorEmpleado, 
     obtenerEmpleadosPorHorario,
     obtenerEmpleadoHorarioPorId,
    crearEmpleadoHorario,
    actualizarEmpleadoHorario,
    eliminarEmpleadoHorario} from "../../Controllers/Empleados_Horarios/empleadosHorarios.controller.js";

const router = Router();

//Rutas para empleados y horarios

//Metodo get
router.get("/", obtenerEmpleadosHorarios);
router.get("/horariosActivos/empleado/:idEmpleado", obtenerHorariosActivosPorEmpleado);
router.get("/empleadosPorHorario/:idHorario", obtenerEmpleadosPorHorario);
router.get("/:idEmpHor", obtenerEmpleadoHorarioPorId);

//Metodo post
router.post("/", crearEmpleadoHorario);

//Metodo put
router.put("/:idEmpHor", actualizarEmpleadoHorario);

//Metodo delete
router.delete("/:idEmpHor", eliminarEmpleadoHorario);

export default router;
