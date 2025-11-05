import db from '../../Config/db.js';



// obtener todos los empleados
export const obtenerEmpleados = async (req, res) => {
  try {
    const obtenerEmpleadosQuery = `
      SELECT e.idEmpleado, e.DNI, e.NombreEmpleado, e.ApellidoEmpleado, e.FechaNacEmpleado,
             e.TelefonoEmpleado, e.DireccionEmpleado, e.SalarioEmpleado, 
             l.NombreLocalidad, c.NombreCat, e.IsActive
      FROM empleados e
      LEFT JOIN localidades l ON e.idLocalidad = l.idLocalidad
      INNER JOIN catEmpleados c ON e.idCatEmpleado = c.idCatEmpleado
    `;
    db.query(obtenerEmpleadosQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener empleados:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// obtener empleado por ID
export const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const obtenerEmpleado = 'SELECT * FROM empleados WHERE idEmpleado = ?';
    db.query(obtenerEmpleado, [idEmpleado], (error, results) => {
      if (error) {
        console.error('Error al obtener el empleado por ID:', error);
        res.status(500).json({ error: 'Error al obtener el empleado por ID' });
        return;
      }
        if (results.length === 0) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// obtener empleado por DNI
export const buscarEmpleadoPorDNI = async (req, res) => {
  try {
    const { DNI } = req.params;
    const buscarEmpleado = 'SELECT * FROM empleados WHERE DNI = ?';
    db.query(buscarEmpleado, [DNI], (error, results) => {
      if (error) {
        console.error('Error al buscar el empleado por DNI:', error);
        res.status(500).json({ error: 'Error al buscar el empleado por DNI' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// obtener empleados activos
export const obtenerEmpleadosActivos = async (req, res) => {
  try {
    const obtenerEmpleadosActivos = 'SELECT * FROM empleados WHERE IsActive = 1';
    db.query(obtenerEmpleadosActivos, (error, results) => {
      if (error) {
        console.error('Error al obtener empleados activos:', error);
        res.status(500).json({ error: 'Error al obtener empleados activos' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

//Obtener empleados inactivos
export const obtenerEmpleadosInactivos = async (req, res) => {
    try {
        const obtenerEmpleadosInactivos = 'SELECT * FROM empleados WHERE IsActive = 0';
        db.query(obtenerEmpleadosInactivos, (error, results) => {
            if (error) {
                console.error('Error al obtener empleados inactivos:', error);
                res.status(500).json({ error: 'Error al obtener empleados inactivos' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//obtener empleados por nombre
export const buscarEmpleadosPorNombre = async (req, res) => {
  try {
    const { NombreEmpleado } = req.params;
    const buscarEmpleados = 'SELECT * FROM empleados WHERE NombreEmpleado LIKE ?';
    db.query(buscarEmpleados, [`%${NombreEmpleado}%`], (error, results) => {
      if (error) {
        console.error('Error al buscar empleados por nombre:', error);
        res.status(500).json({ error: 'Error al buscar empleados por nombre' });
        return;
      }
        res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

//obtener empleados por apellido
export const buscarEmpleadosPorApellido = async (req, res) => {
  try {
    const { ApellidoEmpleado } = req.params;
    const buscarEmpleados = 'SELECT * FROM empleados WHERE ApellidoEmpleado LIKE ?';
    db.query(buscarEmpleados, [`%${ApellidoEmpleado}%`], (error, results) => {
      if (error) {
        console.error('Error al buscar empleados por apellido:', error);
        res.status(500).json({ error: 'Error al buscar empleados por apellido' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Crear nuevo empleado
export const crearEmpleado = async (req, res) => {
  try {
    const { DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, idLocalidad, idUsuario, idCatEmpleado } = req.body;
    
    // 1. Validar campos obligatorios
    if (!DNI || !NombreEmpleado || !ApellidoEmpleado || !FechaNacEmpleado || !SalarioEmpleado || !idCatEmpleado) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    // 2. Validar formato de DNI (solo números, 7-8 dígitos)
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(DNI)) {
      return res.status(400).json({ error: 'El DNI debe contener entre 7 y 8 dígitos numéricos' });
    }

    // 3. Validar que el salario sea positivo
    if (SalarioEmpleado <= 0) {
      return res.status(400).json({ error: 'El salario debe ser un número positivo' });
    }

    // 4. Validar teléfono si existe (solo números y guiones)
    if (TelefonoEmpleado) {
      const telefonoRegex = /^[\d\-\s()]+$/;
      if (!telefonoRegex.test(TelefonoEmpleado)) {
        return res.status(400).json({ error: 'El formato del teléfono no es válido' });
      }
    }

    // 5. Verificar que el DNI no exista ya
    const verificarDNI = 'SELECT * FROM empleados WHERE DNI = ?';
    db.query(verificarDNI, [DNI], (error, results) => {
      if (error) {
        console.error('Error al verificar DNI:', error);
        return res.status(500).json({ error: 'Error al verificar DNI' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'Ya existe un empleado con ese DNI' });
      }

      // 6. Crear el empleado
      const nuevoEmpleado = 'INSERT INTO empleados (DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, idLocalidad, idUsuario, idCatEmpleado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(nuevoEmpleado, [DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, idLocalidad, idUsuario, idCatEmpleado], (error, results) => {
        if (error) {
          console.error('Error al crear el empleado:', error);
          // Error de FK
          if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'Una o más referencias (categoría, localidad, usuario) no existen' });
          }
          return res.status(500).json({ error: 'Error al crear el empleado' });
        }
        res.status(201).json({ 
          message: 'Empleado creado exitosamente', 
          id: results.insertId,
          empleado: { DNI, NombreEmpleado, ApellidoEmpleado }
        });
      });
    });
  } catch (error) {
    console.error('Error al crear el empleado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Actualizar empleado

export const actualizarEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const { DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, idLocalidad, idUsuario, idCatEmpleado } = req.body;
    
    const actualizarEmpleadoQuery = `
      UPDATE empleados 
      SET DNI = ?, NombreEmpleado = ?, ApellidoEmpleado = ?, FechaNacEmpleado = ?, 
          TelefonoEmpleado = ?, DireccionEmpleado = ?, SalarioEmpleado = ?, 
          idLocalidad = ?, idUsuario = ?, idCatEmpleado = ? 
      WHERE idEmpleado = ?
    `;
    
    db.query(actualizarEmpleadoQuery, [DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, idLocalidad, idUsuario, idCatEmpleado, idEmpleado], (error, results) => {
      if (error) {
        console.error('Error al actualizar el empleado:', error);

        // Manejo de errores comunes para actualización
        if (error.code === 'ER_DUP_ENTRY') {
          if (error.message.includes('DNI') || error.sqlMessage?.includes('DNI')) {
            return res.status(400).json({
              message: 'El DNI ya está registrado por otro empleado'
            });
          }
          if (error.message.includes('TelefonoEmpleado') || 
              error.sqlMessage?.includes('TelefonoEmpleado') ||
              error.message.includes('telefono') ||
              error.sqlMessage?.includes('telefono')) {
            return res.status(400).json({
              message: 'El teléfono ya está registrado por otro empleado'
            });
          }
          return res.status(400).json({
            message: 'Los datos ya están registrados por otro empleado'
          });
        }

        return res.status(500).json({ message: 'Error al actualizar empleado' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
      }

      res.status(200).json({ message: 'Empleado actualizado exitosamente' });
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Cambiar estado del empleado (activar/desactivar)
export const cambiarEstadoEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
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
      FROM empleados 
      WHERE idEmpleado = ?
    `;

    db.query(verificarEstadoQuery, [idEmpleado], (err, results) => {
      if (err) {
        console.error('Error al verificar estado del empleado:', err);
        return res.status(500).json({ message: 'Error al verificar estado del empleado' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
      }

      const estadoActual = results[0].IsActive;

      // Validar que el estado nuevo sea diferente al actual
      if (estadoActual === IsActive) {
        const estadoTexto = IsActive === 1 ? 'activo' : 'inactivo';
        return res.status(400).json({ 
          message: `El empleado ya se encuentra ${estadoTexto}` 
        });
      }

      // Si es diferente, proceder con el cambio
      const cambiarEstadoQuery = `
        UPDATE empleados 
        SET IsActive = ?
        WHERE idEmpleado = ?
      `;

      db.query(cambiarEstadoQuery, [IsActive, idEmpleado], (error, updateResults) => {
        if (error) {
          console.error('Error al cambiar estado del empleado:', error);
          return res.status(500).json({ message: 'Error al cambiar estado del empleado' });
        }

        const mensaje = IsActive === 1 ? 'Empleado activado exitosamente' : 'Empleado desactivado exitosamente';
        res.status(200).json({ message: mensaje });
      });
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
