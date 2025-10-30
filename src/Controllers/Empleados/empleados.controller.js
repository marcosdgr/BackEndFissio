import db from '../../config/db.js';

export const obtenerEmpleados = async (req, res) => {
  try {
    db.query('SELECT * FROM empleados', (error, results) => {
      if (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({ error: 'Error al obtener empleados' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

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
    const { DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,idLocalidad,idUsuario,idCatEmpleado, } = req.body;
    const actualizarEmpleado = 'UPDATE empleados SET DNI = ?,NombreEmpleado = ?,ApellidoEmpleado = ?,FechaNacEmpleado = ?,TelefonoEmpleado = ?,DireccionEmpleado = ?,SalarioEmpleado = ?,idLocalidad = ?,idUsuario = ?,idCatEmpleado = ? WHERE idEmpleado = ?';
    db.query(actualizarEmpleado, [DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,idLocalidad,idUsuario,idCatEmpleado, idEmpleado], (error, results) => {
      if (error) {
        console.error('Error al actualizar el empleado:', error);
        res.status(500).json({ error: 'Error al actualizar el empleado' });
        return;
      }
      res.status(200).json({ message: 'Empleado actualizado exitosamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const borradoLogicoEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const actualizarEmpleado = 'UPDATE empleados SET IsActive = 0 WHERE idEmpleado = ?';
    db.query(actualizarEmpleado, [idEmpleado], (error, results) => {
      if (error) {
        console.error('Error al realizar el borrado lógico del empleado:', error);
        res.status(500).json({ error: 'Error al realizar el borrado lógico del empleado' });
        return;
      }
      res.status(200).json({ message: 'Empleado borrado lógicamente exitosamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
