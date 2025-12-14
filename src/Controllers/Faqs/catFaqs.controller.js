import db from "../../Config/db.js";

// Crear categoría
export const crearCategoriaFaq = async (req, res) => {
  try {
    const { NombreCategoria } = req.body;
    const CrearCategoriaQuery = `INSERT INTO cat_faqs (NombreCategoria) VALUES (?)`;

    db.query(CrearCategoriaQuery, [NombreCategoria], (err, result) => {
      if (err) {
        console.error("ERROR SQL:", err);
        return res.status(500).json({ message: "Error al crear categoría", error: err.message });
      }

      const ObtenerCategoriaQuery = `SELECT * FROM cat_faqs WHERE idCatFAQ = ?`;
      db.query(ObtenerCategoriaQuery, [result.insertId], (err2, cat) => {
        if (err2) return res.status(500).json({ message: "Error al obtener categoría" });
        res.status(201).json({ mensaje: "Categoría creada", data: cat[0] });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Listar categorías (activas o todas)
export const traerCategoriasActivas = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const mostrarInactivas = includeInactive === 'true';

    let ListarActivasQuery = `SELECT * FROM cat_faqs`;

    if (!mostrarInactivas) {
      ListarActivasQuery += ` WHERE IsActive = 1`;
    }

    ListarActivasQuery += ` ORDER BY NombreCategoria`;

    db.query(ListarActivasQuery, (err, cats) => {
      if (err) return res.status(500).json({ message: "Error al listar categorías" });
      res.json(cats);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Actualizar
export const actualizarCategoriaFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = [];
    const valores = [];

    if (req.body.NombreCategoria !== undefined) {
      campos.push("NombreCategoria = ?");
      valores.push(req.body.NombreCategoria);
    }
    if (req.body.IsActive !== undefined) {
      campos.push("IsActive = ?");
      valores.push(req.body.IsActive);
    }

    if (campos.length === 0) return res.status(400).json({ mensaje: "No hay datos para actualizar" });

    valores.push(id);
    const ActualizarQuery = `UPDATE cat_faqs SET ${campos.join(", ")} WHERE idCatFAQ = ?`;

    db.query(ActualizarQuery, valores, (err, result) => {
      if (err || result.affectedRows === 0) return res.status(404).json({ mensaje: "Categoría no encontrada" });

      const ObtenerQuery = `SELECT * FROM cat_faqs WHERE idCatFAQ = ?`;
      db.query(ObtenerQuery, [id], (err2, cat) => {
        if (err2) return res.status(500).json({ message: "Error al obtener categoría" });
        res.json({ mensaje: "Categoría actualizada", data: cat[0] });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};