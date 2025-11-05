import db from '../../Config/db.js';

export const obtenerCategoriasEmpleados = async (req, res) => {
  try {
    const obtenerTodasLasCategorias = 'SELECT * FROM catEmpleados';
    db.query(obtenerTodasLasCategorias, (error, results) => {
      if (error) {
        console.error('Error al obtener las categorías de empleados:', error);
        res.status(500).json({ error: 'Error al obtener las categorías de empleados' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error al obtener las categorías de empleados:', error);
    res.status(500).json({ error: 'Error al obtener las categorías de empleados' });
  }
};
export const obtenerCategoriaEmpleadoPorId = async (req, res) => {
  try {
    const { idCatEmpleado } = req.params;
    const obtenerCategoria = 'SELECT * FROM catEmpleados WHERE idCatEmpleado = ?';
    db.query(obtenerCategoria, [idCatEmpleado], (error, results) => {
      if (error) {
        console.error('Error al obtener la categoría de empleado por ID:', error);
        res.status(500).json({ error: 'Error al obtener la categoría de empleado por ID' });
        return;
      }
        if (results.length === 0) {
        res.status(404).json({ error: 'Categoría de empleado no encontrada' });
        return;
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    console.error('Error al obtener la categoría de empleado por ID:', error);
    res.status(500).json({ error: 'Error al obtener la categoría de empleado por ID' });
  }
};
export const crearCategoriaEmpleado = async (req, res) => {
  try {
    const { NombreCat, DescripcionCat } = req.body;
    const nuevaCategoria = 'INSERT INTO catEmpleados (NombreCat, DescripcionCat) VALUES (?, ?)';
    db.query(nuevaCategoria, [NombreCat, DescripcionCat], (error, results) => {
      if (error) {
        console.error('Error al crear la categoría de empleado:', error);
        res.status(500).json({ error: 'Error al crear la categoría de empleado' });
        return;
      }
      res.status(201).json({ idCatEmpleado: results.insertId, NombreCat, DescripcionCat });
    });
  } catch (error) {
    console.error('Error al crear la categoría de empleado:', error);
    res.status(500).json({ error: 'Error al crear la categoría de empleado' });
  }
};
export const actualizarCategoriaEmpleado = async (req, res) => {
  try {
    const { idCatEmpleado } = req.params;
    const { NombreCat, DescripcionCat } = req.body;
    const actualizarCategoria = 'UPDATE catEmpleados SET NombreCat = ?, DescripcionCat = ? WHERE idCatEmpleado = ?';
    db.query(actualizarCategoria, [NombreCat, DescripcionCat, idCatEmpleado], (error, results) => {
      if (error) {
        console.error('Error al actualizar la categoría de empleado:', error);
        res.status(500).json({ error: 'Error al actualizar la categoría de empleado' });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Categoría de empleado no encontrada' });
        return;
      }
      res.status(200).json({ idCatEmpleado, NombreCat, DescripcionCat });
    });
  } catch (error) {
    console.error('Error al actualizar la categoría de empleado:', error);
    res.status(500).json({ error: 'Error al actualizar la categoría de empleado' });
  }
};
export const borradoLogicoCategoriaEmpleado = async (req, res) => {
  try {
    const { idCatEmpleado } = req.params;
    const borrarCategoria = 'UPDATE catEmpleados SET IsActive = 0 WHERE idCatEmpleado = ?';
    db.query(borrarCategoria, [idCatEmpleado], (error, results) => {
      if (error) {
        console.error('Error al realizar el borrado lógico de la categoría de empleado:', error);
        res.status(500).json({ error: 'Error al realizar el borrado lógico de la categoría de empleado' });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Categoría de empleado no encontrada' });
        return;
      }
      res.status(200).json({ message: 'Categoría eliminada lógicamente', idCatEmpleado });
    });
  } catch (error) {
    console.error('Error al realizar el borrado lógico de la categoría de empleado:', error);
    res.status(500).json({ error: 'Error al realizar el borrado lógico de la categoría de empleado' });
  }
};
