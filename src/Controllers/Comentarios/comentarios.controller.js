import db from "../../Config/db.js";

// crear comentario
export const crearComentario = async (req, res) => {
  try {
    const { CalificacionComentario, Comentario: textoComentario, idUsuario } = req.body;

    // Primero buscar el idPaciente usando el idUsuario
    const BuscarPacienteQuery = `
      SELECT idPaciente FROM pacientes WHERE idUsuario = ? AND IsActive = 1
    `;

    db.query(BuscarPacienteQuery, [idUsuario], (errBuscar, pacientes) => {
      if (errBuscar) {
        console.error("Error al buscar paciente: ", errBuscar);
        return res.status(500).json({ message: "Error al buscar paciente" });
      }

      if (!pacientes || pacientes.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado para este usuario" });
      }

      const idPaciente = pacientes[0].idPaciente;

      // Ahora crear el comentario con el idPaciente encontrado
      const CrearComentarioQuery = `
        INSERT INTO comentarios (CalificacionComentario, FechaComentario, Comentario, IsActive, idPaciente)
        VALUES (?, NOW(), ?, 1, ?)
      `;

      db.query(CrearComentarioQuery, [CalificacionComentario, textoComentario, idPaciente], (err, result) => {
        if (err) {
          console.error("Error al crear comentario: ", err);
          return res.status(500).json({ message: "Error al crear comentario" });
        }

        const ObtenerComentarioCreadoQuery = `
          SELECT c.*, p.NombrePaciente AS pacienteNombre
          FROM comentarios c
          JOIN pacientes p ON c.idPaciente = p.idPaciente
          WHERE c.idComentario = ?
        `;

        db.query(ObtenerComentarioCreadoQuery, [result.insertId], (errSelect, comentarios) => {
          if (errSelect) {
            console.error("Error al obtener comentario creado: ", errSelect);
            return res.status(500).json({ message: "Error al obtener comentario" });
          }
          res.status(201).json({
            mensaje: "Comentario creado exitosamente",
            data: comentarios[0],
          });
        });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// traer comentarios activos
export const traerComentariosActivos = async (req, res) => {
  try {
    const ListarComentariosActivosQuery = `
      SELECT c.*, p.NombrePaciente AS pacienteNombre
      FROM comentarios c
      JOIN pacientes p ON c.idPaciente = p.idPaciente
      WHERE c.IsActive = 1
      ORDER BY c.FechaComentario DESC
    `;

    db.query(ListarComentariosActivosQuery, (err, comentarios) => {
      if (err) {
        console.error("Error al traer comentarios: ", err);
        return res.status(500).json({ message: "Error al traer comentarios" });
      }
      res.status(200).json(comentarios);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// traer comentario por ID
export const traerComentarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const ObtenerComentarioPorIdQuery = `
      SELECT c.*, p.NombrePaciente AS pacienteNombre
      FROM comentarios c
      JOIN pacientes p ON c.idPaciente = p.idPaciente
      WHERE c.idComentario = ? AND c.IsActive = 1
    `;

    db.query(ObtenerComentarioPorIdQuery, [id], (err, comentarios) => {
      if (err) {
        console.error("Error al traer comentario por ID: ", err);
        return res.status(500).json({ message: "Error al traer comentario por ID" });
      }
      if (!comentarios || comentarios.length === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }
      res.status(200).json(comentarios[0]);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// actualizar comentario
export const actualizarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { CalificacionComentario, Comentario: textoComentario } = req.body;

    const ActualizarComentarioQuery = `
      UPDATE comentarios 
      SET CalificacionComentario = ?, Comentario = ?
      WHERE idComentario = ? AND IsActive = 1
    `;

    db.query(ActualizarComentarioQuery, [CalificacionComentario, textoComentario, id], (err, result) => {
      if (err) {
        console.error("Error al actualizar comentario: ", err);
        return res.status(500).json({ message: "Error al actualizar comentario" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      const ObtenerComentarioActualizadoQuery = `
        SELECT c.*, p.NombrePaciente AS pacienteNombre
        FROM comentarios c
        JOIN pacientes p ON c.idPaciente = p.idPaciente
        WHERE c.idComentario = ?
      `;

      db.query(ObtenerComentarioActualizadoQuery, [id], (errSelect, comentarios) => {
        if (errSelect) {
          console.error("Error al obtener comentario actualizado: ", errSelect);
          return res.status(500).json({ message: "Error al obtener comentario actualizado" });
        }
        res.status(200).json({
          mensaje: "Comentario actualizado",
          data: comentarios[0],
        });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// borrado lógico comentario
export const borradoLogicoComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const EliminarLogicoComentarioQuery = `
      UPDATE comentarios SET IsActive = 0 WHERE idComentario = ?
    `;

    db.query(EliminarLogicoComentarioQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar comentario: ", err);
        return res.status(500).json({ message: "Error al eliminar comentario" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      res.status(200).json({ mensaje: "Comentario eliminado lógicamente" });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};