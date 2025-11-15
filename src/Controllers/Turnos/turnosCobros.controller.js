import db from "../../Config/db.js";

export const obtenerTurnos = (req, res) => {
  const query = `
    SELECT 
      t.*,
      p.NombrePaciente,
      p.ApellidoPaciente,
      p.DNI,
      tr.NombreTratamiento,
      ts.PrecioUnitario AS PrecioTotal
    FROM turnos t
    LEFT JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN tratamientos tr ON t.idTratamiento = tr.idTratamiento
    LEFT JOIN turno_servicios ts ON t.idTurno = ts.idTurno
    ORDER BY t.FechaRequeridaTurno DESC, t.HorarioRequeridoTurno DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error en obtenerTurnos (cobros):", err);
      return res.status(500).json({ error: "Error al cargar turnos" });
    }

    res.json({ turnos: results });
  });
};