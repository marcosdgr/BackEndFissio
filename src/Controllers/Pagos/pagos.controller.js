import db from "../../Config/db.js";

//  OBTENER TODOS LOS PAGOS 
export const obtenerPagos = (req, res) => {
  const query = `
    SELECT 
      p.idPago,
      p.FechaPago,
      p.MontoPago,
      p.Descripcion,
      p.EstadoPago,
      mp.NombreMedio AS MedioPago,
      tp.NombreTipo AS TipoPago
    FROM pagos p
    JOIN catMediosPago mp ON p.idMedioPago = mp.idMedioPago
    JOIN catTiposPago tp ON p.idTipoPago = tp.idTipoPago
    ORDER BY p.FechaPago DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener los pagos: ", error);
      return res.status(500).json({ error: "Error del servidor al obtener los pagos" });
    }
    const safeResults = results.map(row => ({
      ...row,
      MedioPago: row.MedioPago || "—",
      TipoPago: row.TipoPago || "—"
    }));
    res.status(200).json(safeResults);
  });
};

//  OBTENER PAGO POR ID 
export const obtenerPagoPorId = (req, res) => {
  const { idPago } = req.params;
  const query = `
    SELECT 
      p.*,
      mp.NombreMedio AS MedioPago,
      tp.NombreTipo AS TipoPago
    FROM pagos p
    JOIN catMediosPago mp ON p.idMedioPago = mp.idMedioPago
    JOIN catTiposPago tp ON p.idTipoPago = tp.idTipoPago
    WHERE p.idPago = ?
  `;

  db.query(query, [idPago], (error, results) => {
    if (error) {
      console.error("Error al obtener el pago por ID: ", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    const row = results[0];
    row.MedioPago = row.MedioPago || "—";
    row.TipoPago = row.TipoPago || "—";
    res.status(200).json(row);
  });
};

//  CREAR PAGO 
export const crearPago = (req, res) => {
  const {
    FechaPago, idTipoPago, Descripcion, idMedioPago, MontoPago, EstadoPago = "Pendiente"
  } = req.body;

  if (!FechaPago || !idTipoPago || !idMedioPago || MontoPago === undefined) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (MontoPago < 0) {
    return res.status(400).json({ error: "El monto debe ser mayor o igual a 0" });
  }

  const query = `
    INSERT INTO pagos (FechaPago, idTipoPago, Descripcion, idMedioPago, MontoPago, EstadoPago)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [FechaPago, idTipoPago, Descripcion || null, idMedioPago, MontoPago, EstadoPago], (error, result) => {
    if (error) {
      console.error("Error al crear pago:", error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: "Tipo o medio de pago no existe" });
      }
      return res.status(500).json({ error: "Error al crear pago" });
    }
    res.status(201).json({ message: "Pago creado", idPago: result.insertId });
  });
};

//  ACTUALIZAR PAGO 
export const actualizarPago = (req, res) => {
  const { idPago } = req.params;
  const { FechaPago, idTipoPago, Descripcion, idMedioPago, MontoPago, EstadoPago } = req.body;

  if (!FechaPago || !idTipoPago || !idMedioPago || MontoPago === undefined || !EstadoPago) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (MontoPago < 0) {
    return res.status(400).json({ error: "El monto debe ser mayor o igual a 0" });
  }

  const query = `
    UPDATE pagos 
    SET FechaPago = ?, idTipoPago = ?, Descripcion = ?, idMedioPago = ?, MontoPago = ?, EstadoPago = ?
    WHERE idPago = ?
  `;

  db.query(query, [FechaPago, idTipoPago, Descripcion || null, idMedioPago, MontoPago, EstadoPago, idPago], (error, result) => {
    if (error) {
      console.error("Error al actualizar pago:", error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: "Tipo o medio de pago no existe" });
      }
      return res.status(500).json({ error: "Error al actualizar" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.json({ message: "Pago actualizado" });
  });
};

//  ELIMINAR PAGO 
export const eliminarPago = (req, res) => {
  const { idPago } = req.params;
  db.query("DELETE FROM pagos WHERE idPago = ?", [idPago], (error, result) => {
    if (error) {
      console.error("Error al eliminar pago:", error);
      return res.status(500).json({ error: "Error del servidor" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }
    res.json({ message: "Pago eliminado" });
  });
};