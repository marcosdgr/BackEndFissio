
import db from "../../Config/db.js";

export const obtenerCobros = (req, res) => {
  const query = `
    SELECT 
      c.idCobro,
      c.FechaCobro,
      c.idTurno,
      c.TipoCobro,
      c.idMedioPago,
      c.MontoCobro,
      c.EstadoCobro,
      c.Descripcion,
      CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente,
      mp.NombreMedio AS MedioPago
    FROM cobros c
    LEFT JOIN turnos t ON c.idTurno = t.idTurno
    LEFT JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago
    ORDER BY c.idCobro DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("ERROR SQL:", err);
      return res.status(500).json({ error: "Error al cargar cobros" });
    }
    const safeResults = results.map(row => ({
      ...row,
      Paciente: row.Paciente || "—",
      MedioPago: row.MedioPago || "—"
    }));
    res.json(safeResults);
  });
};

// === OBTENER POR ID ===
export const obtenerCobroPorId = (req, res) => {
  const { idCobro } = req.params;
  const query = `
    SELECT 
      c.*,
      CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente,
      mp.NombreMedio AS MedioPago
    FROM cobros c
    LEFT JOIN turnos t ON c.idTurno = t.idTurno
    LEFT JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago
    WHERE c.idCobro = ?
  `;

  db.query(query, [idCobro], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Cobro no encontrado" });
    }
    const row = results[0];
    row.Paciente = row.Paciente || "—";
    row.MedioPago = row.MedioPago || "—";
    res.json(row);
  });
};

// === CREAR COBRO ===
export const crearCobro = (req, res) => {
  const {
    FechaCobro, idTurno, TipoCobro = "Paciente", idMedioPago, MontoCobro,
    EstadoCobro = "Cobrado", Descripcion
  } = req.body;

  if (!FechaCobro || !idTurno || !idMedioPago || !MontoCobro) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  db.query(
    `INSERT INTO cobros (FechaCobro, idTurno, TipoCobro, idMedioPago, MontoCobro, EstadoCobro, Descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [FechaCobro, idTurno, TipoCobro, idMedioPago, MontoCobro, EstadoCobro, Descripcion || null],
    (err, result) => {
      if (err) {
        console.error("Error al crear cobro:", err);
        return res.status(500).json({ error: "Error al crear" });
      }
      res.status(201).json({ idCobro: result.insertId, ...req.body });
    }
  );
};

// === ACTUALIZAR COBRO ===
export const actualizarCobro = (req, res) => {
  const { idCobro } = req.params;
  const { FechaCobro, idTurno, TipoCobro, idMedioPago, MontoCobro, EstadoCobro, Descripcion } = req.body;

  if (!FechaCobro || !idTurno || !idMedioPago || !MontoCobro || !EstadoCobro) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  db.query(
    `UPDATE cobros SET FechaCobro=?, idTurno=?, TipoCobro=?, idMedioPago=?, MontoCobro=?, EstadoCobro=?, Descripcion=? WHERE idCobro=?`,
    [FechaCobro, idTurno, TipoCobro, idMedioPago, MontoCobro, EstadoCobro, Descripcion || null, idCobro],
    (err, result) => {
      if (err || result.affectedRows === 0) return res.status(404).json({ error: "No encontrado" });
      res.json({ message: "Actualizado" });
    }
  );
};

// === CAMBIAR ESTADO ===
export const cambiarEstadoCobro = (req, res) => {
  const { idCobro } = req.params;
  const { EstadoCobro } = req.body;

  if (!["Cobrado", "Pendiente"].includes(EstadoCobro)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  db.query(
    "UPDATE cobros SET EstadoCobro = ? WHERE idCobro = ?",
    [EstadoCobro, idCobro],
    (err, result) => {
      if (err || result.affectedRows === 0) return res.status(404).json({ error: "No encontrado" });
      res.json({ message: "Estado cambiado" });
    }
  );
};

// === ELIMINAR COBRO ===
export const eliminarCobro = (req, res) => {
  const { idCobro } = req.params;
  db.query("DELETE FROM cobros WHERE idCobro = ?", [idCobro], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado" });
  });
};