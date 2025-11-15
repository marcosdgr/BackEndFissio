import db from "../../Config/db.js";

export const obtenerPacientes = (req, res) => {
  const query = `
    SELECT idPaciente, NombrePaciente, ApellidoPaciente, DNI
    FROM pacientes
    WHERE IsActive = 1
    ORDER BY ApellidoPaciente, NombrePaciente
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error en obtenerPacientes (cobros):", err);
      return res.status(500).json({ error: "Error al cargar pacientes" });
    }
    res.json({ pacientes: results });
  });
};