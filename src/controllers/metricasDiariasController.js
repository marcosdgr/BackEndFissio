import db from "../config/db.js";

// Crear
export const crearMetricaDiaria = async (req, res) => {
  try {
    const {
      FechaBalance, IngresosCobrados, IngresosPendientes,
      EgresosPagados, EgresosPendientes,
      TurnosProgramados, TurnosAtendidos, TurnosCancelados,
      idTurno, idPago, idCobro
    } = req.body;

    const CrearMetricaQuery = `
      INSERT INTO metricasDiarias (
        FechaBalance, IngresosCobrados, IngresosPendientes,
        EgresosPagados, EgresosPendientes,
        TurnosProgramados, TurnosAtendidos, TurnosCancelados,
        idTurno, idPago, idCobro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(CrearMetricaQuery, [
      FechaBalance, IngresosCobrados || 0, IngresosPendientes || 0,
      EgresosPagados || 0, EgresosPendientes || 0,
      TurnosProgramados || 0, TurnosAtendidos || 0, TurnosCancelados || 0,
      idTurno, idPago, idCobro
    ], (err, result) => {
      if (err) return res.status(500).json({ message: "Error al crear métrica" });

      const ObtenerMetricaQuery = `SELECT * FROM metricasDiarias WHERE idMetrica = ?`;
      db.query(ObtenerMetricaQuery, [result.insertId], (err2, metrica) => {
        if (err2) return res.status(500).json({ message: "Error al obtener métrica" });
        res.status(201).json({ mensaje: "Métrica creada", data: metrica[0] });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Listar todas
export const traerMetricasDiarias = async (req, res) => {
  try {
    const ListarMetricasQuery = `
      SELECT * FROM metricasDiarias 
      ORDER BY FechaBalance DESC
    `;
    db.query(ListarMetricasQuery, (err, metricas) => {
      if (err) return res.status(500).json({ message: "Error al listar métricas" });
      res.json(metricas);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Por fecha
export const traerMetricaPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const ObtenerPorFechaQuery = `SELECT * FROM metricasDiarias WHERE FechaBalance = ?`;
    db.query(ObtenerPorFechaQuery, [fecha], (err, metrica) => {
      if (err || !metrica.length) return res.status(404).json({ mensaje: "Métrica no encontrada" });
      res.json(metrica[0]);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};