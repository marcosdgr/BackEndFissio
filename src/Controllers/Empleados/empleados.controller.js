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
    const { DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,idLocalidad,idUsuario,idCatEmpleado, } = req.body;
    const nuevoEmpleado = 'INSERT INTO empleados (DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,idLocalidad,idUsuario,idCatEmpleado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(nuevoEmpleado, [DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,idLocalidad,idUsuario,idCatEmpleado], (error, results) => {
      if (error) {
        console.error('Error al crear el empleado:', error);
        res.status(500).json({ error: 'Error al crear el empleado' });
        return;
      }
      res.status(201).json({ message: 'Empleado creado exitosamente', id: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

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
