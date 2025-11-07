import db from '../../Config/db.js';

export const obtenerServicios = (req, res) => {
    try {
        const obtenerTodosLosServicios = 'SELECT * FROM servicios';
        db.query(obtenerTodosLosServicios, (error, results) => {
            if (error) {
                console.error('Error al obtener servicios:', error);
                return res.status(500).json({ error: 'Error al obtener servicios' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
export const obtenerServicioPorId = (req, res) => {
    try {
        const { idServicio } = req.params;
        const obtenerUnServicioPorId = 'SELECT * FROM servicios WHERE idServicio = ?';
        db.query(obtenerUnServicioPorId, [idServicio], (error, results) => {
            if (error) {
                console.error('Error al obtener servicio por ID:', error);
                return res.status(500).json({ error: 'Error al obtener servicio por ID' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
export const crearServicio = (req, res) => {
    try {
        const { NombreServicio, DescripcionServicio } = req.body;
        
        // Validar campos obligatorios
        if (!NombreServicio || typeof NombreServicio !== "string" || NombreServicio.trim() === "") {
            return res.status(400).json({ error: "El campo 'NombreServicio' es obligatorio" });
        }
        
        // Verificar si el nombre del servicio ya existe (case-insensitive)
        const verificarNombreExistente = 'SELECT idServicio FROM servicios WHERE LOWER(NombreServicio) = LOWER(?)';
        db.query(verificarNombreExistente, [NombreServicio.trim()], (error, results) => {
            if (error) {
                console.error('Error al verificar nombre del servicio:', error);
                return res.status(500).json({ error: 'Error al verificar nombre del servicio' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Ya existe un servicio con ese nombre (sin distinción de mayúsculas/minúsculas)' });
            }
            
            // Si no existe, proceder a crear el servicio
            const nuevoServicio = 'INSERT INTO servicios (NombreServicio, DescripcionServicio) VALUES (?, ?)';
            db.query(nuevoServicio, [NombreServicio.trim(), DescripcionServicio || null], (error, results) => {
                if (error) {
                    console.error('Error al crear servicio:', error);
                    return res.status(500).json({ error: 'Error al crear servicio' });
                }
                res.status(201).json({ 
                    message: 'Servicio creado exitosamente',
                    idServicio: results.insertId, 
                    NombreServicio: NombreServicio.trim(), 
                    DescripcionServicio: DescripcionServicio || null
                });
            });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const actualizarServicio = (req, res) => {
    try {
        const { idServicio } = req.params;
        const { NombreServicio, DescripcionServicio } = req.body;
        
        // Validar campos obligatorios
        if (!NombreServicio || typeof NombreServicio !== "string" || NombreServicio.trim() === "") {
            return res.status(400).json({ error: "El campo 'NombreServicio' es obligatorio" });
        }
        
        // Verificar si existe otro servicio con el mismo nombre (excluyendo el actual, case-insensitive)
        const verificarNombreExistente = 'SELECT idServicio FROM servicios WHERE LOWER(NombreServicio) = LOWER(?) AND idServicio != ?';
        db.query(verificarNombreExistente, [NombreServicio.trim(), idServicio], (error, results) => {
            if (error) {
                console.error('Error al verificar nombre del servicio:', error);
                return res.status(500).json({ error: 'Error al verificar nombre del servicio' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ error: 'Ya existe otro servicio con ese nombre (sin distinción de mayúsculas/minúsculas)' });
            }
            
            // Si no existe, proceder a actualizar el servicio
            const actualizarUnServicio = 'UPDATE servicios SET NombreServicio = ?, DescripcionServicio = ? WHERE idServicio = ?';
            db.query(actualizarUnServicio, [NombreServicio.trim(), DescripcionServicio || null, idServicio], (error, results) => {
                if (error) {
                    console.error('Error al actualizar servicio:', error);
                    return res.status(500).json({ error: 'Error al actualizar servicio' });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: 'Servicio no encontrado' });
                }
                res.status(200).json({ 
                    message: 'Servicio actualizado exitosamente',
                    idServicio: idServicio, 
                    NombreServicio: NombreServicio.trim(), 
                    DescripcionServicio: DescripcionServicio || null
                });
            });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const cambiarEstadoServicio = (req, res) => {
    try {
        const { idServicio } = req.params;
        const { IsActive } = req.body;
        
        // Validar que IsActive sea un valor válido
        if (IsActive !== 0 && IsActive !== 1) {
            return res.status(400).json({ 
                message: 'IsActive debe ser 0 (inactivo) o 1 (activo)' 
            });
        }

    // Primero verificar el estado actual del empleado
    const verificarEstadoQuery = `
      SELECT IsActive 
      FROM servicios
      WHERE idServicio = ?
    `;

    db.query(verificarEstadoQuery, [idServicio], (err, results) => {
      if (err) {
        console.error('Error al verificar estado del servicio:', err);
        return res.status(500).json({ message: 'Error al verificar estado del servicio' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Servicio no encontrado' });
      }

      const estadoActual = results[0].IsActive;

      // Validar que el estado nuevo sea diferente al actual
      if (estadoActual === IsActive) {
        const estadoTexto = IsActive === 1 ? 'activo' : 'inactivo';
        return res.status(400).json({
          message: `El servicio ya se encuentra ${estadoTexto}`
        });
      }

      // Si es diferente, proceder con el cambio
      const cambiarEstadoQuery = `
        UPDATE servicios
        SET IsActive = ?
        WHERE idServicio = ?
      `;

      db.query(cambiarEstadoQuery, [IsActive, idServicio], (error, updateResults) => {
        if (error) {
          console.error('Error al cambiar estado del servicio:', error);
          return res.status(500).json({ message: 'Error al cambiar estado del servicio' });
        }

        const mensaje = IsActive === 1 ? 'Servicio activado exitosamente' : 'Servicio desactivado exitosamente';
        res.status(200).json({ message: mensaje });
      });
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
