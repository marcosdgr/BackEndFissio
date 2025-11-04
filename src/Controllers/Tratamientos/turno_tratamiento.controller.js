import db from '../../Config/db.js';

// Obtener todas las relaciones turno-tratamiento
export const obtenerTodasLasRelaciones = async (req, res) => {
    try {
        const obtenerTodas = `
            SELECT 
                tt.idTurnoTratamiento,
                tt.idTurno,
                tt.idTratamiento,
                t.FechaRequeridaTurno,
                t.HorarioRequeridoTurno,
                t.EstadoTurno,
                p.NombrePaciente,
                p.ApellidoPaciente,
                tr.NombreTratamiento,
                tr.DuracionTratamiento
            FROM turno_tratamientos tt
            INNER JOIN turnos t ON tt.idTurno = t.idTurno
            INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
            INNER JOIN tratamientos tr ON tt.idTratamiento = tr.idTratamiento
            ORDER BY t.FechaRequeridaTurno DESC, t.HorarioRequeridoTurno DESC
        `;
        
        db.query(obtenerTodas, (error, results) => {
            if (error) {
                console.error("Error al obtener las relaciones turno-tratamiento:", error);
                return res.status(500).json({ message: "Error al obtener las relaciones turno-tratamiento" });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener tratamientos de un turno específico
export const obtenerTratamientosPorTurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        
        const obtenerPorTurno = `
            SELECT 
                tt.idTurnoTratamiento,
                tt.idTurno,
                tt.idTratamiento,
                tr.NombreTratamiento,
                tr.DescripcionTratamiento,
                tr.DuracionTratamiento,
                tr.InformeTratamiento
            FROM turno_tratamientos tt
            INNER JOIN tratamientos tr ON tt.idTratamiento = tr.idTratamiento
            WHERE tt.idTurno = ? AND tr.IsActive = 1
            ORDER BY tr.NombreTratamiento
        `;
        
        db.query(obtenerPorTurno, [idTurno], (error, results) => {
            if (error) {
                console.error("Error al obtener tratamientos del turno:", error);
                return res.status(500).json({ message: "Error al obtener tratamientos del turno" });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener turnos que usan un tratamiento específico
export const obtenerTurnosPorTratamiento = async (req, res) => {
    try {
        const { idTratamiento } = req.params;
        
        const obtenerPorTratamiento = `
            SELECT 
                tt.idTurnoTratamiento,
                tt.idTurno,
                tt.idTratamiento,
                t.FechaSolicitudTurno,
                t.FechaRequeridaTurno,
                t.HorarioRequeridoTurno,
                t.HorarioInicioTurno,
                t.HorarioFinTurno,
                t.EstadoTurno,
                p.idPaciente,
                p.NombrePaciente,
                p.ApellidoPaciente,
                p.DNI,
                e.NombreEmpleado,
                e.ApellidoEmpleado,
                s.NombreSala
            FROM turno_tratamientos tt
            INNER JOIN turnos t ON tt.idTurno = t.idTurno
            INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
            LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
            LEFT JOIN salas s ON t.idSala = s.idSala
            WHERE tt.idTratamiento = ?
            ORDER BY t.FechaRequeridaTurno DESC, t.HorarioRequeridoTurno DESC
        `;
        
        db.query(obtenerPorTratamiento, [idTratamiento], (error, results) => {
            if (error) {
                console.error("Error al obtener turnos del tratamiento:", error);
                return res.status(500).json({ message: "Error al obtener turnos del tratamiento" });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Asignar un tratamiento a un turno
export const asignarTratamientoATurno = async (req, res) => {
    try {
        const { idTurno, idTratamiento, Cantidad, PrecioUnitario, Observaciones } = req.body;
        
        // Validar campos obligatorios
        if (!idTurno || !idTratamiento || !PrecioUnitario) {
            return res.status(400).json({ message: "Los campos idTurno, idTratamiento y PrecioUnitario son obligatorios" });
        }
        
        // Verificar que el turno existe
        const verificarTurno = "SELECT idTurno, EstadoTurno FROM turnos WHERE idTurno = ?";
        db.query(verificarTurno, [idTurno], (err, turnoResults) => {
            if (err) {
                console.error("Error al verificar turno:", err);
                return res.status(500).json({ message: "Error en el servidor" });
            }
            
            if (turnoResults.length === 0) {
                return res.status(404).json({ message: "Turno no encontrado" });
            }
            
            // Verificar que el tratamiento existe y está activo
            const verificarTratamiento = "SELECT idTratamiento, NombreTratamiento, IsActive FROM tratamientos WHERE idTratamiento = ?";
            db.query(verificarTratamiento, [idTratamiento], (error, tratamientoResults) => {
                if (error) {
                    console.error("Error al verificar tratamiento:", error);
                    return res.status(500).json({ message: "Error en el servidor" });
                }
                
                if (tratamientoResults.length === 0) {
                    return res.status(404).json({ message: "Tratamiento no encontrado" });
                }
                
                if (tratamientoResults[0].IsActive === 0) {
                    return res.status(400).json({ message: "El tratamiento no está activo" });
                }
                
                // Verificar si ya existe la relación
                const verificarRelacion = "SELECT idTurnoTratamiento FROM turno_tratamientos WHERE idTurno = ? AND idTratamiento = ?";
                db.query(verificarRelacion, [idTurno, idTratamiento], (err, relacionResults) => {
                    if (err) {
                        console.error("Error al verificar relación:", err);
                        return res.status(500).json({ message: "Error en el servidor" });
                    }
                    
                    if (relacionResults.length > 0) {
                        return res.status(409).json({ message: "Este tratamiento ya está asignado a este turno" });
                    }
                    
                    // Crear la relación
                    const crearRelacion = "INSERT INTO turno_tratamientos (idTurno, idTratamiento, Cantidad, PrecioUnitario, Observaciones) VALUES (?, ?, ?, ?, ?)";
                    db.query(crearRelacion, [idTurno, idTratamiento, Cantidad || 1, PrecioUnitario, Observaciones || null], (error, results) => {
                        if (error) {
                            console.error("Error al asignar tratamiento al turno:", error);
                            return res.status(500).json({ message: "Error al asignar tratamiento al turno" });
                        }
                        
                        return res.status(201).json({
                            message: "Tratamiento asignado al turno exitosamente",
                            id: results.insertId,
                            relacion: {
                                idTurno,
                                idTratamiento,
                                nombreTratamiento: tratamientoResults[0].NombreTratamiento
                            }
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Asignar múltiples tratamientos a un turno
export const asignarMultiplesTratamientos = async (req, res) => {
    try {
        const { idTurno, tratamientos } = req.body; 
        // tratamientos es un array de objetos: [{ idTratamiento, PrecioUnitario, Cantidad?, Observaciones? }]
        
        // Validar campos obligatorios
        if (!idTurno || !tratamientos || !Array.isArray(tratamientos) || tratamientos.length === 0) {
            return res.status(400).json({ 
                message: "Se requiere idTurno y un array de tratamientos con al menos un elemento" 
            });
        }
        
        // Validar que cada tratamiento tenga idTratamiento y PrecioUnitario
        for (let i = 0; i < tratamientos.length; i++) {
            if (!tratamientos[i].idTratamiento || !tratamientos[i].PrecioUnitario) {
                return res.status(400).json({ 
                    message: `El tratamiento en posición ${i} debe tener idTratamiento y PrecioUnitario` 
                });
            }
        }
        
        // Verificar que el turno existe
        const verificarTurno = "SELECT idTurno FROM turnos WHERE idTurno = ?";
        db.query(verificarTurno, [idTurno], (err, turnoResults) => {
            if (err) {
                console.error("Error al verificar turno:", err);
                return res.status(500).json({ message: "Error en el servidor" });
            }
            
            if (turnoResults.length === 0) {
                return res.status(404).json({ message: "Turno no encontrado" });
            }
            
            // Construir query para insertar múltiples registros
            const values = tratamientos.map(t => [
                idTurno, 
                t.idTratamiento, 
                t.Cantidad || 1, 
                t.PrecioUnitario,
                t.Observaciones || null
            ]);
            
            const insertarMultiples = "INSERT INTO turno_tratamientos (idTurno, idTratamiento, Cantidad, PrecioUnitario, Observaciones) VALUES ?";
            
            db.query(insertarMultiples, [values], (error, results) => {
                if (error) {
                    console.error("Error al asignar múltiples tratamientos:", error);
                    
                    // Error de FK (tratamiento no existe)
                    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({ message: "Uno o más tratamientos no existen" });
                    }
                    
                    // Error de duplicado
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: "Uno o más tratamientos ya están asignados a este turno" });
                    }
                    
                    return res.status(500).json({ message: "Error al asignar múltiples tratamientos" });
                }
                
                return res.status(201).json({
                    message: "Tratamientos asignados exitosamente",
                    cantidadAsignada: results.affectedRows,
                    idTurno
                });
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Eliminar un tratamiento de un turno
export const eliminarTratamientoDeTurno = async (req, res) => {
    try {
        const { idTurnoTratamiento } = req.params;
        
        // Verificar si la relación existe
        const verificarRelacion = `
            SELECT tt.*, t.EstadoTurno 
            FROM turno_tratamientos tt
            INNER JOIN turnos t ON tt.idTurno = t.idTurno
            WHERE tt.idTurnoTratamiento = ?
        `;
        
        db.query(verificarRelacion, [idTurnoTratamiento], (err, results) => {
            if (err) {
                console.error("Error al verificar relación:", err);
                return res.status(500).json({ message: "Error en el servidor" });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: "Relación turno-tratamiento no encontrada" });
            }
            
            // Opcional: Validar que el turno no esté finalizado
            if (results[0].EstadoTurno === 'Finalizado') {
                return res.status(400).json({ 
                    message: "No se puede eliminar tratamientos de un turno finalizado" 
                });
            }
            
            // Eliminar la relación
            const eliminarRelacion = "DELETE FROM turno_tratamientos WHERE idTurnoTratamiento = ?";
            db.query(eliminarRelacion, [idTurnoTratamiento], (error, deleteResults) => {
                if (error) {
                    console.error("Error al eliminar relación turno-tratamiento:", error);
                    return res.status(500).json({ message: "Error al eliminar relación turno-tratamiento" });
                }
                
                return res.status(200).json({ message: "Tratamiento eliminado del turno exitosamente" });
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Eliminar todos los tratamientos de un turno
export const eliminarTodosTratamientosDeTurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        
        // Verificar que el turno existe
        const verificarTurno = "SELECT idTurno, EstadoTurno FROM turnos WHERE idTurno = ?";
        db.query(verificarTurno, [idTurno], (err, turnoResults) => {
            if (err) {
                console.error("Error al verificar turno:", err);
                return res.status(500).json({ message: "Error en el servidor" });
            }
            
            if (turnoResults.length === 0) {
                return res.status(404).json({ message: "Turno no encontrado" });
            }
            
            // Opcional: Validar que el turno no esté finalizado
            if (turnoResults[0].EstadoTurno === 'Finalizado') {
                return res.status(400).json({ 
                    message: "No se pueden eliminar tratamientos de un turno finalizado" 
                });
            }
            
            // Eliminar todas las relaciones del turno
            const eliminarTodas = "DELETE FROM turno_tratamientos WHERE idTurno = ?";
            db.query(eliminarTodas, [idTurno], (error, results) => {
                if (error) {
                    console.error("Error al eliminar tratamientos del turno:", error);
                    return res.status(500).json({ message: "Error al eliminar tratamientos del turno" });
                }
                
                return res.status(200).json({ 
                    message: "Todos los tratamientos del turno fueron eliminados exitosamente",
                    cantidadEliminada: results.affectedRows
                });
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener estadísticas de tratamientos por turno
export const obtenerEstadisticasTratamientos = async (req, res) => {
    try {
        const estadisticas = `
            SELECT 
                tr.idTratamiento,
                tr.NombreTratamiento,
                COUNT(tt.idTurnoTratamiento) as totalTurnos,
                COUNT(DISTINCT tt.idTurno) as turnosUnicos
            FROM tratamientos tr
            LEFT JOIN turno_tratamientos tt ON tr.idTratamiento = tt.idTratamiento
            WHERE tr.IsActive = 1
            GROUP BY tr.idTratamiento, tr.NombreTratamiento
            ORDER BY totalTurnos DESC, tr.NombreTratamiento
        `;
        
        db.query(estadisticas, (error, results) => {
            if (error) {
                console.error("Error al obtener estadísticas:", error);
                return res.status(500).json({ message: "Error al obtener estadísticas" });
            }
            
            return res.status(200).json({
                message: "Estadísticas obtenidas exitosamente",
                estadisticas: results
            });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
