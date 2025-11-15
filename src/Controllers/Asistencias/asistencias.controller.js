import db from "../../Config/db.js";

// Obtener todas las asistencias con información del empleado
export const obtenerAsistencias = (req, res) => {
    try {
        const obtenerAsistenciasEmpleado = "SELECT a.idAsistencia, a.Fecha, a.HoraEntrada, a.HoraSalida, a.Observaciones, e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, e.DNI FROM asistencias a JOIN empleados e ON a.idEmpleado = e.idEmpleado ORDER BY a.Fecha DESC, a.HoraEntrada DESC";

        db.query(obtenerAsistenciasEmpleado, (error, results) => {
            if (error) {
                console.error("Error al obtener las asistencias:", error);
                return res.status(500).json({ error: "Error del servidor al obtener las asistencias" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No hay asistencias registradas" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Obtener una asistencia específica por ID
export const obtenerAsistenciaPorId = (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const asistenciaPorId = "SELECT a.idAsistencia, a.Fecha, a.HoraEntrada, a.HoraSalida, a.Observaciones, e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, e.DNI FROM asistencias a JOIN empleados e ON a.idEmpleado = e.idEmpleado WHERE a.idAsistencia = ?" ; 

        db.query(asistenciaPorId, [idAsistencia], (error, results) => {
            if (error) {
                console.error("Error al obtener la asistencia por ID:", error);
                return res.status(500).json({ error: "Error del servidor al obtener la asistencia" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "Asistencia no encontrada" });
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Obtener todas las asistencias de un empleado específico
export const obtenerAsistenciasPorEmpleado = (req, res) => {
    try {
        const { idEmpleado } = req.params;
        const asistenciaPorEmpleado = " SELECT a.idAsistencia, a.Fecha, a.HoraEntrada, a.HoraSalida, a.Observaciones,e.NombreEmpleado, e.ApellidoEmpleado, e.DNI FROM asistencias a JOIN empleados e ON a.idEmpleado = e.idEmpleado WHERE a.idEmpleado = ? ORDER BY a.Fecha DESC ";

        db.query(asistenciaPorEmpleado, [idEmpleado], (error, results) => {
            if (error) {
                console.error("Error al obtener las asistencias del empleado:", error);
                return res.status(500).json({ error: "Error del servidor al obtener las asistencias del empleado" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontraron asistencias para este empleado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Obtener asistencias por fecha específica
export const obtenerAsistenciasPorFecha = (req, res) => {
    try {
        const { fecha } = req.params;  // ← Cambio a minúscula
        const asistenciaPorFecha = "SELECT a.idAsistencia, a.Fecha, a.HoraEntrada, a.HoraSalida, a.Observaciones, e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, e.DNI FROM asistencias a JOIN empleados e ON a.idEmpleado = e.idEmpleado WHERE a.Fecha = ? ORDER BY a.HoraEntrada";

        db.query(asistenciaPorFecha, [fecha], (error, results) => {  // ← Cambio a minúscula
            if (error) {
                console.error("Error al obtener las asistencias por fecha:", error);
                return res.status(500).json({ error: "Error del servidor al obtener las asistencias por fecha" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontraron asistencias para esta fecha" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Obtener asistencias por rango de fechas
export const obtenerAsistenciasPorRango = (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: "Los parámetros 'fechaInicio' y 'fechaFin' son obligatorios" });
        }

        const asistenciaPorRango = "SELECT a.idAsistencia, a.Fecha, a.HoraEntrada, a.HoraSalida, a.Observaciones, e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, e.DNI FROM asistencias a JOIN empleados e ON a.idEmpleado = e.idEmpleado WHERE a.Fecha BETWEEN ? AND ? ORDER BY a.Fecha DESC, a.HoraEntrada DESC";

        db.query(asistenciaPorRango, [fechaInicio, fechaFin], (error, results) => {
            if (error) {
                console.error("Error al obtener las asistencias por rango:", error);
                return res.status(500).json({ error: "Error del servidor al obtener las asistencias por rango" });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: "No se encontraron asistencias en el rango de fechas especificado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Crear nueva asistencia (registrar entrada)
export const crearAsistencia = (req, res) => {
    try {
        const { Fecha, HoraEntrada, HoraSalida, Observaciones, idEmpleado } = req.body;

        // Validaciones
        if (!Fecha || !idEmpleado) {
            return res.status(400).json({ message: "Los campos 'Fecha' e 'idEmpleado' son obligatorios" });
        }

        if (isNaN(Number(idEmpleado))) {
            return res.status(400).json({ message: "El campo 'idEmpleado' debe ser un número válido" });
        }

        const nuevaAsistencia = "INSERT INTO asistencias (Fecha, HoraEntrada, HoraSalida, Observaciones, idEmpleado, Presente) VALUES (?, ?, ?, ?, ?, 1)";
        db.query(nuevaAsistencia, [Fecha, HoraEntrada || null, HoraSalida || null, Observaciones || null, idEmpleado], (error, results) => {
            if (error) {
                console.error("Error al crear la asistencia:", error);
                return res.status(500).json({ error: "Error del servidor al crear la asistencia" });
            }
            res.status(201).json({ 
                message: "Asistencia registrada correctamente - Empleado marcado como presente", 
                idInsertado: results.insertId,
                presente: true
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Registrar hora de entrada (si no existe asistencia para ese día)
export const registrarEntrada = (req, res) => {
    try {
        const { Fecha, HoraEntrada, idEmpleado, Observaciones } = req.body;

        if (!Fecha || !HoraEntrada || !idEmpleado) {
            return res.status(400).json({ message: "Los campos 'Fecha', 'HoraEntrada' e 'idEmpleado' son obligatorios" });
        }

        const entradaNueva = "INSERT INTO asistencias (Fecha, HoraEntrada, idEmpleado, Observaciones, Presente) VALUES (?, ?, ?, ?, 1)";
        db.query(entradaNueva, [Fecha, HoraEntrada, idEmpleado, Observaciones || null], (error, results) => {
            if (error) {
                console.error("Error al registrar la entrada:", error);
                return res.status(500).json({ error: "Error del servidor al registrar la entrada" });
            }
            res.status(201).json({ 
                message: "Entrada registrada correctamente", 
                idAsistencia: results.insertId 
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Registrar hora de salida (actualizar asistencia existente)
export const registrarSalida = (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const { HoraSalida, Observaciones } = req.body;

        if (!HoraSalida) {
            return res.status(400).json({ message: "El campo 'HoraSalida' es obligatorio" });
        }

        // Construir query dinámicamente
        let salidaNueva = "UPDATE asistencias SET HoraSalida = ? , Presente = 0"; //query dinamica que cambia si hay observaciones o no, osea solo se puede notificar el horario de salida o tambien puede notificar el horario de salida con la observacion.
        const params = [HoraSalida];
        
        // agrega observaciones  por ejemplo en el caso de salir temprano y notificarlo
        if (Observaciones) {
            salidaNueva += ", Observaciones = ?";
            params.push(Observaciones);
        }

        salidaNueva += " WHERE idAsistencia = ?";
        params.push(idAsistencia);

        db.query(salidaNueva, params, (error, results) => {
            if (error) {
                console.error("Error al registrar la salida:", error);
                return res.status(500).json({ error: "Error del servidor al registrar la salida" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Asistencia no encontrada" });
            }
            res.status(200).json({ message: "Salida registrada correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Actualizar una asistencia completa
export const actualizarAsistencia = (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const { Fecha, HoraEntrada, HoraSalida, Observaciones, idEmpleado } = req.body;

        // Validación: al menos un campo debe ser proporcionado
        if (!Fecha && !HoraEntrada && !HoraSalida && !Observaciones && !idEmpleado) {
            return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
        }

        // Construir query dinámicamente
        const atributos = []; // guarda las partes del set por ejemplo de ["Fecha = ?", "HoraSalida = ?"]
        const valores = []; // guarda los valores (ej: ["2024-11-02", "17:00:00", 12])

        if (Fecha) {
            atributos.push("Fecha = ?");
            valores.push(Fecha);
        }
        if (HoraEntrada !== undefined) { // !==undefined permite enviar valores vacios para borrar el campo, por ejmplo cuando hay un error a la hora de cargar el registro.
            atributos.push("HoraEntrada = ?");
            valores.push(HoraEntrada || null);
        }
        if (HoraSalida !== undefined) {
            atributos.push("HoraSalida = ?");
            valores.push(HoraSalida || null);
        }
        if (Observaciones !== undefined) {
            atributos.push("Observaciones = ?");
            valores.push(Observaciones || null);
        }
        if (idEmpleado && !isNaN(Number(idEmpleado))) {
            atributos.push("idEmpleado = ?");
            valores.push(idEmpleado);
        }

        valores.push(idAsistencia);

        const asistenciaActualizada = "UPDATE asistencias SET " + atributos.join(', ') + " WHERE idAsistencia = ?"; // aqui inserto las variables dentro de un string cocatenando. convienrte el array en string separado por comas
        db.query(asistenciaActualizada, valores, (error, results) => {
            if (error) {
                console.error("Error al actualizar la asistencia:", error);
                return res.status(500).json({ error: "Error del servidor al actualizar la asistencia" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Asistencia no encontrada" });
            }
            res.status(200).json({ message: "Asistencia actualizada correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Eliminar una asistencia (borrado físico)
export const eliminarAsistencia = (req, res) => {
    try {
        const { idAsistencia } = req.params;
        const query = "DELETE FROM asistencias WHERE idAsistencia = ?";

        db.query(query, [idAsistencia], (error, results) => {
            if (error) {
                console.error("Error al eliminar la asistencia:", error);
                return res.status(500).json({ error: "Error del servidor al eliminar la asistencia" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Asistencia no encontrada" });
            }
            res.status(200).json({ message: "Asistencia eliminada correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};
