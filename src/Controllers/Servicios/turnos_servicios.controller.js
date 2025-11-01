import db from '../../Config/db.js';

// Obtener todos los turnos-servicios con información completa
export const obtenerTurnosServicios = async (req, res) => {
    try {
        const obtenerTodosQuery = `
            SELECT ts.idTurnoServicio, ts.idTurno, ts.idServicio, ts.Cantidad, ts.PrecioUnitario,
                   s.NombreServicio, s.DescripcionServicio,
                   t.FechaRequeridaTurno, t.EstadoTurno,
                   p.NombrePaciente, p.ApellidoPaciente
            FROM turno_servicios ts
            INNER JOIN servicios s ON ts.idServicio = s.idServicio
            INNER JOIN turnos t ON ts.idTurno = t.idTurno
            INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
        `;
        db.query(obtenerTodosQuery, (error, results) => {
            if (error) {
                console.error('Error al obtener turnos de servicios:', error);
                return res.status(500).json({ message: 'Error al obtener turnos de servicios' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener turno-servicio por ID
export const obtenerTurnoServicioPorId = async (req, res) => {
    try {
        const { idTurnoServicio } = req.params;
        const obtenerPorIdQuery = `
            SELECT ts.idTurnoServicio, ts.idTurno, ts.idServicio, ts.Cantidad, ts.PrecioUnitario,
                   s.NombreServicio, s.DescripcionServicio,
                   t.FechaRequeridaTurno, t.EstadoTurno
            FROM turno_servicios ts
            INNER JOIN servicios s ON ts.idServicio = s.idServicio
            INNER JOIN turnos t ON ts.idTurno = t.idTurno
            WHERE ts.idTurnoServicio = ?
        `;
        db.query(obtenerPorIdQuery, [idTurnoServicio], (error, results) => {
            if (error) {
                console.error('Error al obtener turno de servicio por ID:', error);
                return res.status(500).json({ message: 'Error al obtener turno de servicio por ID' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Turno de servicio no encontrado' });
            }
            return res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Obtener servicios de un turno específico
export const obtenerServiciosPorTurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        const obtenerServiciosQuery = `
            SELECT ts.idTurnoServicio, ts.idServicio, ts.Cantidad, ts.PrecioUnitario,
                   s.NombreServicio, s.DescripcionServicio,
                   (ts.Cantidad * ts.PrecioUnitario) AS Subtotal
            FROM turno_servicios ts
            INNER JOIN servicios s ON ts.idServicio = s.idServicio
            WHERE ts.idTurno = ?
        `;
        db.query(obtenerServiciosQuery, [idTurno], (error, results) => {
            if (error) {
                console.error('Error al obtener servicios del turno:', error);
                return res.status(500).json({ message: 'Error al obtener servicios del turno' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Crear turno-servicio
export const crearTurnoServicio = async (req, res) => {
    try {
        const { idTurno, idServicio, Cantidad, PrecioUnitario } = req.body;

        // 1. Validar campos obligatorios
        if (!idTurno || !idServicio) {
            return res.status(400).json({ message: 'El turno y el servicio son obligatorios' });
        }

        // 2. Validar cantidad
        const cantidad = Cantidad || 1;
        if (cantidad < 1) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
        }

        // 3. Validar precio unitario si se proporciona
        if (PrecioUnitario !== undefined && PrecioUnitario < 0) {
            return res.status(400).json({ message: 'El precio unitario no puede ser negativo' });
        }

        // 4. Verificar que el turno existe
        const verificarTurnoQuery = 'SELECT * FROM turnos WHERE idTurno = ?';
        db.query(verificarTurnoQuery, [idTurno], (error, results) => {
            if (error) {
                console.error('Error al verificar turno:', error);
                return res.status(500).json({ message: 'Error al verificar turno' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'El turno especificado no existe' });
            }

            // 5. Verificar que el servicio existe y está activo
            const verificarServicioQuery = 'SELECT * FROM servicios WHERE idServicio = ? AND IsActive = 1';
            db.query(verificarServicioQuery, [idServicio], (error, results) => {
                if (error) {
                    console.error('Error al verificar servicio:', error);
                    return res.status(500).json({ message: 'Error al verificar servicio' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ message: 'El servicio especificado no existe o está inactivo' });
                }

                // 6. Verificar que no exista ya la combinación turno-servicio
                const verificarDuplicadoQuery = 'SELECT * FROM turno_servicios WHERE idTurno = ? AND idServicio = ?';
                db.query(verificarDuplicadoQuery, [idTurno, idServicio], (error, results) => {
                    if (error) {
                        console.error('Error al verificar duplicado:', error);
                        return res.status(500).json({ message: 'Error al verificar duplicado' });
                    }

                    if (results.length > 0) {
                        return res.status(409).json({ message: 'Este servicio ya está asignado a este turno' });
                    }

                    // 7. Crear el turno-servicio
                    const crearTurnoServicioQuery = `
                        INSERT INTO turno_servicios (idTurno, idServicio, Cantidad, PrecioUnitario)
                        VALUES (?, ?, ?, ?)
                    `;
                    db.query(crearTurnoServicioQuery, [idTurno, idServicio, cantidad, PrecioUnitario], (error, results) => {
                        if (error) {
                            console.error('Error al crear turno-servicio:', error);
                            return res.status(500).json({ message: 'Error al crear turno-servicio' });
                        }

                        res.status(201).json({
                            message: 'Turno-servicio creado exitosamente',
                            id: results.insertId,
                            idTurno,
                            idServicio,
                            Cantidad: cantidad,
                            PrecioUnitario
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

// Modificar turno-servicio
export const actualizarTurnoServicio = async (req, res) => {
    try {
        const { idTurnoServicio } = req.params;
        const { Cantidad, PrecioUnitario } = req.body;
        const actualizarQuery = `
            UPDATE turno_servicios
            SET Cantidad = ?, PrecioUnitario = ?
            WHERE idTurnoServicio = ?
        `;
        db.query(actualizarQuery, [Cantidad, PrecioUnitario, idTurnoServicio], (error, results) => {
            if (error) {
                console.error('Error al actualizar turno-servicio:', error);
                return res.status(500).json({ message: 'Error al actualizar turno-servicio' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Turno-servicio no encontrado' });
            }

            res.status(200).json({ message: 'Turno-servicio actualizado exitosamente' });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const eliminarTurnoServicio = async (req, res) => {
    try {
        const { idTurnoServicio } = req.params;
        const eliminarQuery = `
            DELETE FROM turno_servicios
            WHERE idTurnoServicio = ?
        `;
        db.query(eliminarQuery, [idTurnoServicio], (error, results) => {
            if (error) {
                console.error('Error al eliminar turno-servicio:', error);
                return res.status(500).json({ message: 'Error al eliminar turno-servicio' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Turno-servicio no encontrado' });
            }

            res.status(200).json({ message: 'Turno-servicio eliminado exitosamente' });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
