import Joi from "joi";
import db from "../Config/db.js";

export const crearComentarioSchema = Joi.object({
  CalificacionComentario: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      "number.base": "Calificación debe ser un número entero",
      "number.min": "La calificación debe ser al menos 1",
      "number.max": "La calificación no puede exceder 5",
      "any.required": "La calificación es requerida",
    }),

  Comentario: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "string.empty": "El comentario no puede estar vacío",
      "string.min": "El comentario debe tener al menos 1 carácter",
      "string.max": "El comentario no puede exceder 1000 caracteres",
      "any.required": "El comentario es requerido",
    }),

  idUsuario: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "ID de usuario debe ser un número entero",
      "number.min": "ID de usuario debe ser al menos 1",
      "any.required": "ID de usuario es requerido",
    }),
});

export const actualizarComentarioSchema = Joi.object({
  CalificacionComentario: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      "number.base": "Calificación debe ser un número entero",
      "number.min": "La calificación debe ser al menos 1",
      "number.max": "La calificación no puede exceder 5",
    }),

  Comentario: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      "string.empty": "El comentario no puede estar vacío",
      "string.min": "El comentario debe tener al menos 1 carácter",
      "string.max": "El comentario no puede exceder 100 caracteres",
    }),
});

// Obtener comentarios publicados (para HomePage)
// Modificado para ordenar por fecha de comentario descendente
export const traerComentariosPublicados = async (req, res) => {
  try {
    const ListarComentariosPublicadosQuery = `
      SELECT c.*, p.NombrePaciente AS pacienteNombre
      FROM comentarios c
      JOIN pacientes p ON c.idPaciente = p.idPaciente
      WHERE c.IsActive = 1 AND c.IsPublicado = 1
      ORDER BY c.FechaComentario DESC
    `;

    db.query(ListarComentariosPublicadosQuery, (err, comentarios) => {
      if (err) {
        console.error("Error al traer comentarios publicados: ", err);
        return res.status(500).json({ message: "Error al traer comentarios publicados" });
      }
      res.status(200).json(comentarios);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Publicar comentario
export const publicarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const PublicarComentarioQuery = `
      UPDATE comentarios SET IsPublicado = 1 WHERE idComentario = ?
    `;

    db.query(PublicarComentarioQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al publicar comentario: ", err);
        return res.status(500).json({ message: "Error al publicar comentario" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      res.status(200).json({ mensaje: "Comentario publicado exitosamente" });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Despublicar comentario
export const despublicarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const DespublicarComentarioQuery = `
      UPDATE comentarios SET IsPublicado = 0 WHERE idComentario = ?
    `;

    db.query(DespublicarComentarioQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al despublicar comentario: ", err);
        return res.status(500).json({ message: "Error al despublicar comentario" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      res.status(200).json({ mensaje: "Comentario despublicado exitosamente" });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};