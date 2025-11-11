import db from "../../Config/db.js";

// === CREAR FAQ ===
export const crearFaq = async (req, res) => {
  try {
    const { Pregunta, Respuesta, Categoria, idCatFAQ } = req.body;

    const CrearFaqQuery = `
      INSERT INTO faqs (Pregunta, Respuesta, Categoria, idCatFAQ)
      VALUES (?, ?, ?, ?)
    `;

    db.query(CrearFaqQuery, [Pregunta, Respuesta, Categoria, idCatFAQ], (err, result) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ message: "Error al crear FAQ", error: err.message });
      }

      const ObtenerFaqQuery = `
        SELECT f.*, c.NombreCategoria 
        FROM faqs f 
        LEFT JOIN cat_faqs c ON f.idCatFAQ = c.idCatFAQ 
        WHERE f.idFAQ = ?
      `;
      db.query(ObtenerFaqQuery, [result.insertId], (err2, faq) => {
        if (err2) return res.status(500).json({ message: "Error al obtener FAQ" });
        res.status(201).json({ mensaje: "FAQ creada", data: faq[0] });
      });
    });
  } catch (error) {
    console.error("Error del servidor:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// === LISTAR ACTIVAS ===
export const traerFaqsActivas = async (req, res) => {
  try {
    const ListarQuery = `
      SELECT f.*, c.NombreCategoria 
      FROM faqs f 
      LEFT JOIN cat_faqs c ON f.idCatFAQ = c.idCatFAQ 
      WHERE f.IsActive = 1 
      ORDER BY f.FechaCreacion DESC
    `;
    db.query(ListarQuery, (err, faqs) => {
      if (err) return res.status(500).json({ message: "Error al listar FAQs" });
      res.json(faqs);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// === POR ID ===
export const traerFaqPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ObtenerQuery = `
      SELECT f.*, c.NombreCategoria 
      FROM faqs f 
      LEFT JOIN cat_faqs c ON f.idCatFAQ = c.idCatFAQ 
      WHERE f.idFAQ = ? AND f.IsActive = 1
    `;
    db.query(ObtenerQuery, [id], (err, faq) => {
      if (err || !faq.length) return res.status(404).json({ mensaje: "FAQ no encontrada" });
      res.json(faq[0]);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// === ACTUALIZAR FAQ (NUEVO) ===
export const actualizarFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { Pregunta, Respuesta, Categoria, idCatFAQ } = req.body;

    const campos = [];
    const valores = [];

    if (Pregunta !== undefined) { campos.push("Pregunta = ?"); valores.push(Pregunta); }
    if (Respuesta !== undefined) { campos.push("Respuesta = ?"); valores.push(Respuesta); }
    if (Categoria !== undefined) { campos.push("Categoria = ?"); valores.push(Categoria); }
    if (idCatFAQ !== undefined) { campos.push("idCatFAQ = ?"); valores.push(idCatFAQ); }

    if (campos.length === 0) return res.status(400).json({ message: "No hay datos para actualizar" });

    valores.push(id);
    const query = `UPDATE faqs SET ${campos.join(", ")} WHERE idFAQ = ?`;

    db.query(query, valores, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(404).json({ message: "FAQ no encontrada" });
      }

      const obtenerQuery = `
        SELECT f.*, c.NombreCategoria 
        FROM faqs f 
        LEFT JOIN cat_faqs c ON f.idCatFAQ = c.idCatFAQ 
        WHERE f.idFAQ = ?
      `;
      db.query(obtenerQuery, [id], (err2, faq) => {
        if (err2) return res.status(500).json({ message: "Error al obtener FAQ" });
        res.json({ mensaje: "FAQ actualizada", data: faq[0] });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// === CAMBIAR ESTADO (NUEVO) ===
export const cambiarEstadoFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { IsActive } = req.body;

    if (IsActive === undefined) {
      return res.status(400).json({ message: "IsActive es requerido" });
    }

    const query = `UPDATE faqs SET IsActive = ? WHERE idFAQ = ?`;
    db.query(query, [IsActive ? 1 : 0, id], (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(404).json({ message: "FAQ no encontrada" });
      }
      res.json({ mensaje: "Estado actualizado" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};