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
    const obtenerEmpleado = 'SELECT * FROM empleados WHERE id = ?';
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

export const crearEmpleado = async (req, res) => {
  try {
    const { DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,IsActive,idLocalidad,idUsuario,idCatEmpleado, } = req.body;
    const nuevoEmpleado = 'INSERT INTO empleados (DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,IsActive,idLocalidad,idUsuario,idCatEmpleado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(nuevoEmpleado, [DNI,NombreEmpleado,ApellidoEmpleado,FechaNacEmpleado,TelefonoEmpleado,DireccionEmpleado,SalarioEmpleado,IsActive,idLocalidad,idUsuario,idCatEmpleado], (error, results) => {
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
    const actualizarEmpleado = 'UPDATE empleados SET DNI = ?,NombreEmpleado = ?,ApellidoEmpleado = ?,FechaNacEmpleado = ?,TelefonoEmpleado = ?,DireccionEmpleado = ?,SalarioEmpleado = ?,idLocalidad = ?,idUsuario = ?,idCatEmpleado = ? WHERE id = ?';
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
    const actualizarEmpleado = 'UPDATE empleados SET IsActive = 0 WHERE id = ?';
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
