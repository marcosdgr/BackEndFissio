import db from '../../Config/db.js';

//Obtener todos los tratamientos
export const obtenerTodosLosTratamientos = async (req, res) => {
    try {
        const obtenerTodos = "Select * From tratamientos";
        db.query(obtenerTodos, (error, results) => {
            if (error) {
                console.error("Error al obtener todos los tratamientos:", error);
                return res.status(500).json({ message: "Error al obtener todos los tratamientos" });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener todos los tratamientos con manejo de estado para usar una sola query en el front
export const obtenerTratamientosPorEstado = async (req, res) => {
    try {   
        const { estado } = req.params; // 'activo' o 'inactivo'
        const obtenerPorEstado = "Select * From tratamientos WHERE IsActive = ?";

        db.query(obtenerPorEstado, [estado === 'activo' ? 1 : 0], (error, results) => {
            if (error) {
                console.error("Error al obtener los tratamientos por estado:", error);
                return res.status(500).json({ message: "Error al obtener los tratamientos por estado" });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener un tratamiento por ID
export const obtenerTratamientoPorId = async (req, res) => {
    try {
        const { idTratamiento } = req.params;
        const obtenerPorId = "Select * From tratamientos WHERE idTratamiento = ?";

        db.query(obtenerPorId, [idTratamiento], (error, results) => {
            if (error) {
                console.error("Error al obtener el tratamiento por ID:", error);
                return res.status(500).json({ message: "Error al obtener el tratamiento por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Tratamiento no encontrado" });
            }
            return res.status(200).json(results[0]); // Devolver solo el primer elemento
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

//Obtener tratamiento por nombre 
export const obtenerTratamientoPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;
        const obtenerPorNombre = "Select * From tratamientos WHERE NombreTratamiento = ?";
        db.query(obtenerPorNombre, [nombre], (error, results) => {
            if (error) {
                console.error("Error al obtener el tratamiento por nombre:", error);
                return res.status(500).json({ message: "Error al obtener el tratamiento por nombre" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Tratamiento no encontrado" });
            }
            return res.status(200).json(results[0]); // Devolver solo el primer elemento
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Crear un nuevo tratamiento  
export const crearTratamiento = async (req, res) => {
    try {
        const { NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento } = req.body;
        
        // Validación para que los campos obligatorios estén presentes
        if (!NombreTratamiento || !DescripcionTratamiento || !DuracionTratamiento) {
            return res.status(400).json({ message: "Los campos NombreTratamiento, DescripcionTratamiento y DuracionTratamiento son obligatorios." });
        }
        
        // Validar que la duración sea un número positivo
        if (DuracionTratamiento <= 0) {
            return res.status(400).json({ message: "La duración debe ser un número positivo" });
        }
        
        const nuevoTratamiento = "INSERT INTO tratamientos (NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento) VALUES (?, ?, ?, ?)";
        
        db.query(nuevoTratamiento, [NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento || null], (error, results) => {
            if (error) {
                console.error("Error al crear un nuevo tratamiento:", error);
                
                // Manejar error de nombre duplicado
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: "Ya existe un tratamiento con ese nombre" });
                }
                
                return res.status(500).json({ message: "Error al crear un nuevo tratamiento" });
            }
            return res.status(201).json({ 
                message: "Tratamiento creado exitosamente", 
                id: results.insertId,
                tratamiento: { NombreTratamiento, DescripcionTratamiento, DuracionTratamiento }
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Actualizar un tratamiento
export const actualizarTratamiento = async (req, res) => {
    try {
        const { idTratamiento } = req.params;
        const { NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento } = req.body;

        // Validación para que los campos obligatorios estén presentes
        if (!NombreTratamiento || !DescripcionTratamiento || !DuracionTratamiento) {
            return res.status(400).json({ message: "Los campos NombreTratamiento, DescripcionTratamiento y DuracionTratamiento son obligatorios." });
        }

        // Validar que la duración sea un número positivo
        if (DuracionTratamiento <= 0) {
            return res.status(400).json({ message: "La duración debe ser un número positivo" });
        }

        // Verificar si el nuevo nombre ya existe en otro tratamiento
        const verificarNombre = "SELECT idTratamiento FROM tratamientos WHERE NombreTratamiento = ? AND idTratamiento != ?";
        db.query(verificarNombre, [NombreTratamiento, idTratamiento], (error, results) => {
            if (error) {
                console.error("Error al verificar nombre del tratamiento:", error);
                return res.status(500).json({ message: "Error en el servidor" });
            }

            if (results.length > 0) {
                return res.status(409).json({ message: "Ya existe otro tratamiento con ese nombre" });
            }

            // Si no existe duplicado, proceder con la actualización
            const actualizarTratamiento = "UPDATE tratamientos SET NombreTratamiento = ?, DescripcionTratamiento = ?, DuracionTratamiento = ?, InformeTratamiento = ? WHERE idTratamiento = ?";
            db.query(actualizarTratamiento, [NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento || null, idTratamiento], (error, results) => {
                if (error) {
                    console.error("Error al actualizar el tratamiento:", error);
                    
                    // Manejar error de nombre duplicado por constraint UNIQUE
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: "Ya existe un tratamiento con ese nombre" });
                    }
                    
                    return res.status(500).json({ message: "Error al actualizar el tratamiento" });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "Tratamiento no encontrado" });
                }
                return res.status(200).json({ message: "Tratamiento actualizado exitosamente" });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor" });
    }
};

// Cambiar estado del tratamiento (activar/desactivar)
export const cambiarEstadoTratamiento = async (req, res) => {
    try {
        const { idTratamiento } = req.params;
        const { IsActive } = req.body; // Espera 0 (inactivo) o 1 (activo)

        // Validar que IsActive sea un valor válido
        if (IsActive !== 0 && IsActive !== 1) {
            return res.status(400).json({ 
                message: 'IsActive debe ser 0 (inactivo) o 1 (activo)' 
            });
        }

        // Verificar el estado actual del tratamiento
        const verificarEstado = "SELECT IsActive FROM tratamientos WHERE idTratamiento = ?";
        
        db.query(verificarEstado, [idTratamiento], (err, results) => {
            if (err) {
                console.error('Error al verificar estado del tratamiento:', err);
                return res.status(500).json({ message: 'Error al verificar estado del tratamiento' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Tratamiento no encontrado' });
            }

            const estadoActual = results[0].IsActive;

            // Validar que el estado nuevo sea diferente al actual
            if (estadoActual === IsActive) {
                const estadoTexto = IsActive === 1 ? 'activo' : 'inactivo';
                return res.status(400).json({ 
                    message: `El tratamiento ya se encuentra ${estadoTexto}` 
                });
            }

            // Si se quiere desactivar, verificar que no esté en uso
            if (IsActive === 0) {
                const verificarUso = `
                    SELECT 
                        (SELECT COUNT(*) FROM turnos WHERE idTratamiento = ?) + 
                        (SELECT COUNT(*) FROM turno_tratamientos WHERE idTratamiento = ?) as totalUso
                `;
                
                db.query(verificarUso, [idTratamiento, idTratamiento], (error, usoResults) => {
                    if (error) {
                        console.error('Error al verificar uso del tratamiento:', error);
                        return res.status(500).json({ message: 'Error en el servidor' });
                    }

                    if (usoResults[0].totalUso > 0) {
                        return res.status(409).json({ 
                            message: 'No se puede desactivar el tratamiento porque está siendo usado en turnos existentes' 
                        });
                    }

                    // Proceder con el cambio de estado
                    cambiarEstado();
                });
            } else {
                // Si se activa, proceder directamente
                cambiarEstado();
            }

            function cambiarEstado() {
                const cambiarEstado = "UPDATE tratamientos SET IsActive = ? WHERE idTratamiento = ?";
                
                db.query(cambiarEstado, [IsActive, idTratamiento], (error, updateResults) => {
                    if (error) {
                        console.error('Error al cambiar el estado del tratamiento:', error);
                        return res.status(500).json({ message: 'Error al cambiar el estado del tratamiento' });
                    }

                    const mensaje = IsActive === 1 ? 'Tratamiento activado exitosamente' : 'Tratamiento desactivado exitosamente';
                    res.status(200).json({ message: mensaje });
                });
            }
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};





