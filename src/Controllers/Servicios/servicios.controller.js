import db from '../../Config/db.js';

export const obtenerServicios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicios');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ error: 'Error al obtener servicios' });
    }
};
export const obtenerServicioPorId = async (req, res) => {
    const { idServicio } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM servicios WHERE id = ?', [idServicio]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener servicio por ID:', error);
        res.status(500).json({ error: 'Error al obtener servicio por ID' });
    }
};
export const crearServicio = async (req, res) => {
    const { NombreServicio, DescripcionServicio } = req.body;
    try {
        const [result] = await db.query('INSERT INTO servicios (NombreServicio, DescripcionServicio) VALUES (?, ?)', [NombreServicio, DescripcionServicio]);
        res.status(201).json({ id: result.insertId, NombreServicio, DescripcionServicio });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ error: 'Error al crear servicio' });
    }
};

export const actualizarServicio = async (req, res) => {
    const { idServicio } = req.params;
    const { NombreServicio, DescripcionServicio } = req.body;
    try {
        const [result] = await db.query('UPDATE servicios SET NombreServicio = ?, DescripcionServicio = ? WHERE id = ?', [NombreServicio, DescripcionServicio, idServicio]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        res.json({ id: idServicio, NombreServicio, DescripcionServicio });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error al actualizar servicio' });
    }
};

export const cambiarEstadoServicio = async (req, res) => {
    const { idServicio } = req.params;
    const { IsActive } = req.body;
    try{
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
