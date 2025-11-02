import db from "../config/db.js";

// Crear FAQ
export const crearFaq = async (req, res) => {
  try {
    const { Pregunta, Respuesta, Categoria, idCatFAQ } = req.body;
    console.log("Datos recibidos:", req.body);

    const CrearFaqQuery = `
      INSERT INTO faqs (Pregunta, Respuesta, Categoria, idCatFAQ)
      VALUES (?, ?, ?, ?)
    `;

    db.query(CrearFaqQuery, [Pregunta, Respuesta, Categoria, idCatFAQ], (err, result) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ 
          message: "Error al crear FAQ", 
          error: err.message 
        });
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

// Listar activas con categoría
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

// Por ID
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