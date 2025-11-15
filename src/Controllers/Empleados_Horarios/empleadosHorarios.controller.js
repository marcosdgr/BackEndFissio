import db from "../../Config/db.js";

//Traer todos los empleados con su horario 
export const obtenerEmpleadosHorarios = async (req, res) => {
    try {
        const obtenerEmpleados = "SELECT eh.idEmpHor,e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, h.idHorario, h.Fecha, h.HoraEntradaEsperada, h.HoraSalidaEsperada FROM empleados_horarios eh JOIN empleados e ON eh.idEmpleado = e.idEmpleado JOIN horariosTrabajo h ON eh.idHorario = h.idHorario ORDER BY eh.idEmpHor DESC";

        db.query(obtenerEmpleados, (error, results) => {
            if (error) {
                console.error("Error al obtener empleados y horarios:", error);
                console.error("Query SQL:", obtenerEmpleados);
                console.error("Detalles del error:", error.message, error.code, error.sqlMessage);
                return res.status(500).json({ error: "Error del servidor al obtener empleados y horarios", detalle: error.sqlMessage || error.message });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No hay registros de empleados con horarios" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};
//traer todos los horarios activos asignados a cada empleado
export const obtenerHorariosActivosPorEmpleado = async (req, res) => {
    try {
        const { idEmpleado } = req.params;
        const query = "SELECT h.idHorario, h.Fecha, h.HoraEntradaEsperada, h.HoraSalidaEsperada FROM horariosTrabajo h JOIN empleados_horarios eh ON h.idHorario = eh.idHorario WHERE eh.idEmpleado = ? AND h.IsActive = 1";
        db.query(query, [idEmpleado], (error, results) => {
            if (error) {
                console.error("Error al obtener los horarios activos del empleado:", error);
                return res.status(500).json({ error: "Error del servidor al obtener los horarios activos del empleado" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontraron horarios activos para el empleado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

//traer todos los empleados asignados a un horario específico
export const obtenerEmpleadosPorHorario = async (req, res) => {
    try {
        const { idHorario } = req.params;
        const empleadosporhorario = "SELECT e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado FROM empleados e JOIN empleados_horarios eh ON e.idEmpleado = eh.idEmpleado WHERE eh.idHorario = ?";
        db.query(empleadosporhorario, [idHorario], (error, results) => {
            if (error) {
                console.error("Error al obtener los empleados por horario:", error);
                return res.status(500).json({ error: "Error del servidor al obtener los empleados por horario" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontraron empleados para el horario especificado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

//Obtener el horario de un empleado por el idEmpHor
export const obtenerEmpleadoHorarioPorId = async (req, res) => {
    try {
        const { idEmpHor } = req.params;

        const empleadoHorario = "SELECT eh.idEmpHor, e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, h.idHorario, h.Fecha, h.HoraEntradaEsperada, h.HoraSalidaEsperada FROM empleados_horarios eh JOIN empleados e ON eh.idEmpleado = e.idEmpleado JOIN horariosTrabajo h ON eh.idHorario = h.idHorario WHERE eh.idEmpHor = ?";
        db.query(empleadoHorario, [idEmpHor], (error, results) => {
            if (error) {
                console.error("Error al obtener el horario del empleado:", error);
                return res.status(500).json({ error: "Error del servidor al obtener el horario del empleado" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontró el horario del empleado" });
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Crear nuevo registro donde un empleado es asignado a un horario
export const crearEmpleadoHorario = async (req, res) => {
    try {
        const { idEmpleado, idHorario } = req.body;
        const nuevoEmpleadoHorario = "INSERT INTO empleados_horarios (idEmpleado, idHorario) VALUES (?, ?)";
        // validacion donde el horario y el empleados sean campos que se tienen que llenar si o si
        if (!idEmpleado || !idHorario) {
            return res.status(400).json({ error: "Los campos idEmpleado e idHorario son obligatorios" });
        }
        db.query(nuevoEmpleadoHorario, [idEmpleado, idHorario], (error, results) => {
            if (error) {
                console.error("Error al crear el registro empleado-horario:", error);
                return res.status(500).json({ error: "Error del servidor al crear el registro empleado-horario" });
            }
            res.status(201).json({ message: "Registro empleado-horario creado exitosamente", id: results.insertId });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Actualizar un registro empleado-horario para poder cambiar el horario o el empleado
export const actualizarEmpleadoHorario = async (req, res) => {
    try {
        const { idEmpHor } = req.params;
        const { idEmpleado, idHorario } = req.body;

        // Validación donde el horario y el empleado son campos que se tienen que llenar sí o sí
        if (!idEmpleado || !idHorario) {
            return res.status(400).json({ error: "Los campos idEmpleado e idHorario son obligatorios" });
        }

        const actualizarRegistro = "UPDATE empleados_horarios SET idEmpleado = ?, idHorario = ? WHERE idEmpHor = ?";
        db.query(actualizarRegistro, [idEmpleado, idHorario, idEmpHor], (error, results) => {
            if (error) {
                console.error("Error al actualizar el registro empleado-horario:", error);
                return res.status(500).json({ error: "Error del servidor al actualizar el registro empleado-horario" });
            }
            res.status(200).json({ message: "Registro empleado-horario actualizado exitosamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Eliminar registro del empleado con su horario 
export const eliminarEmpleadoHorario = async (req, res) => {
    try {
        const { idEmpHor } = req.params;
        const eliminarRegistro = "DELETE FROM empleados_horarios WHERE idEmpHor = ?";
        db.query(eliminarRegistro, [idEmpHor], (error, results) => {
            if (error) {
                console.error("Error al eliminar el registro empleado-horario:", error);
                return res.status(500).json({ error: "Error del servidor al eliminar el registro empleado-horario" });
            }
            res.status(200).json({ message: "Registro empleado-horario eliminado exitosamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

