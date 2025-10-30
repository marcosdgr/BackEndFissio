import db from "../config/db.js";

// Crear sala
export const crearSala = async (req, res) => {
  try {
    const { NombreSala, Capacidad } = req.body;
    const query = `
      INSERT INTO salas (NombreSala, Capacidad, IsActive)
      VALUES (?, ?, 1)
    `;

    db.query(query, [NombreSala, Capacidad], (err, result) => {
      if (err) {
        console.error("Error al crear sala: ", err);
        return res.status(500).json({ message: "Error al crear sala" });
      }

      const selectQuery = `SELECT * FROM salas WHERE idSala = ?`;
      db.query(selectQuery, [result.insertId], (errSelect, sala) => {
        if (errSelect) {
          return res.status(500).json({ message: "Error al obtener sala" });
        }
        res.status(201).json({
          mensaje: "Sala creada exitosamente",
          data: sala[0],
        });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Traer todas activas
export const traerSalasActivas = async (req, res) => {
  try {
    const query = `SELECT * FROM salas WHERE IsActive = 1 ORDER BY NombreSala`;
    db.query(query, (err, salas) => {
      if (err) {
        console.error("Error al traer salas: ", err);
        return res.status(500).json({ message: "Error al traer salas" });
      }
      res.status(200).json(salas);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Traer por ID
export const traerSalaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM salas WHERE idSala = ? AND IsActive = 1`;
    db.query(query, [id], (err, salas) => {
      if (err) {
        return res.status(500).json({ message: "Error al traer sala" });
      }
      if (!salas || salas.length === 0) {
        return res.status(404).json({ mensaje: "Sala no encontrada" });
      }
      res.status(200).json(salas[0]);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar
export const actualizarSala = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreSala, Capacidad } = req.body;

    const campos = [];
    const valores = [];

    if (NombreSala !== undefined) {
      campos.push("NombreSala = ?");
      valores.push(NombreSala);
    }
    if (Capacidad !== undefined) {
      campos.push("Capacidad = ?");
      valores.push(Capacidad);
    }

    if (campos.length === 0) {
      return res.status(400).json({ mensaje: "No se enviaron datos para actualizar" });
    }

    valores.push(id);
    const query = `UPDATE salas SET ${campos.join(", ")} WHERE idSala = ? AND IsActive = 1`;

    db.query(query, valores, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error al actualizar sala" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Sala no encontrada" });
      }

      const selectQuery = `SELECT * FROM salas WHERE idSala = ?`;
      db.query(selectQuery, [id], (errSelect, sala) => {
        if (errSelect) {
          return res.status(500).json({ message: "Error al obtener sala actualizada" });
        }
        res.status(200).json({
          mensaje: "Sala actualizada",
          data: sala[0],
        });
      });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Borrado lógico
export const borradoLogicoSala = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `UPDATE salas SET IsActive = 0 WHERE idSala = ?`;
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error al eliminar sala" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Sala no encontrada" });
      }
      res.status(200).json({ mensaje: "Sala eliminada lógicamente" });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};