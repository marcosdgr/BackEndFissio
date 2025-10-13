import db from "../config/db.js";

// Crear comentario
export const crearComentario = async (req, res) => {
  try {
    const { CalificacionComentario, Comentario: textoComentario, idPaciente } = req.body;
    const query = `
      INSERT INTO comentarios (CalificacionComentario, FechaComentario, Comentario, IsActive, idPaciente)
      VALUES (?, NOW(), ?, 1, ?)
    `;
    db.query(query, [CalificacionComentario, textoComentario, idPaciente], (err, result) => {
      if (err) {
        console.error("Error al crear comentario: ", err);
        return res.status(500).json({ message: "Error al crear comentario" });
      }

      // Obtener el comentario creado con info del paciente
      const selectQuery = `
        SELECT c.*, p.nombre AS pacienteNombre
        FROM comentarios c
        JOIN pacientes p ON c.idPaciente = p.idPaciente
        WHERE c.idComentario = ?
      `;
      db.query(selectQuery, [result.insertId], (errSelect, comentarios) => {
        if (errSelect) {
          console.error("Error al obtener comentario: ", errSelect);
          return res.status(500).json({ message: "Error al obtener comentario" });
        }
        res.status(201).json({ mensaje: 'Comentario creado exitosamente', data: comentarios[0] });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Traer todos los comentarios activos
export const traerComentariosActivos = async (req, res) => {
  try {
    const query = `
      SELECT c.*, p.nombre AS pacienteNombre
      FROM comentarios c
      JOIN pacientes p ON c.idPaciente = p.idPaciente
      WHERE c.IsActive = 1
      ORDER BY c.FechaComentario DESC
    `;
    db.query(query, (err, comentarios) => {
      if (err) {
        console.error("Error al traer comentarios: ", err);
        res.status(500).json({ message: "Error al traer comentarios" });
      }
      res.status(200).json(comentarios);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Traer comentario por ID
export const traerComentarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT c.*, p.nombre AS pacienteNombre
      FROM comentarios c
      JOIN pacientes p ON c.idPaciente = p.idPaciente
      WHERE c.idComentario = ? AND c.IsActive = 1
    `;
    db.query(query, [id], (err, comentarios) => {
      if (err) {
        console.error("Error al traer comentario por ID: ", err);
        res.status(500).json({ message: "Error al traer comentario por ID" });
      }
      if (comentarios.length === 0) {
        return res.status(404).json({ mensaje: 'Comentario no encontrado' });
      }
      res.status(200).json(comentarios[0]);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar comentario
export const actualizarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { CalificacionComentario, Comentario: textoComentario } = req.body;
    const query = `
      UPDATE comentarios 
      SET CalificacionComentario = ?, Comentario = ?
      WHERE idComentario = ? AND IsActive = 1
    `;
    db.query(query, [CalificacionComentario, textoComentario, id], (err, result) => {
      if (err) {
        console.error("Error al actualizar comentario: ", err);
        return res.status(500).json({ message: "Error al actualizar comentario" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Comentario no encontrado' });
      }
      
      // Obtener el actualizado
      const selectQuery = `
        SELECT c.*, p.nombre AS pacienteNombre
        FROM comentarios c
        JOIN pacientes p ON c.idPaciente = p.idPaciente
        WHERE c.idComentario = ?
      `;
      db.query(selectQuery, [id], (errSelect, comentarios) => {
        if (errSelect) {
          console.error("Error al obtener comentario actualizado: ", errSelect);
          return res.status(500).json({ message: "Error al obtener comentario actualizado" });
        }
        res.status(200).json({ mensaje: 'Comentario actualizado', data: comentarios[0] });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Borrado lógico de comentario
export const borradoLogicoComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'UPDATE comentarios SET IsActive = 0 WHERE idComentario = ?';
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar comentario: ", err);
        return res.status(500).json({ message: "Error al eliminar comentario" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Comentario no encontrado' });
      }
      
      res.status(200).json({ mensaje: 'Comentario eliminado lógicamente' });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};