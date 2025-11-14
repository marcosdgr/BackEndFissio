// Controllers/Metricas/metricasEnVivo.controller.js
import db from "../../Config/db.js";

export const obtenerMetricasEnVivo = async (req, res) => {
  const { fecha } = req.query;
  const fechaQuery = fecha || new Date().toISOString().split('T')[0];

  try {
    const query = `
      SELECT 
        ? AS FechaBalance,

        -- Ingresos
        COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                  JOIN turnos t ON c.idTurno = t.idTurno
                  WHERE DATE(c.FechaCobro) = ? AND c.EstadoCobro = 'Cobrado'), 0) AS IngresosCobrados,

        COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                  JOIN turnos t ON c.idTurno = t.idTurno
                  WHERE DATE(c.FechaCobro) <= ? AND c.EstadoCobro = 'Pendiente'), 0) AS IngresosPendientes,

        -- Egresos
        COALESCE((SELECT SUM(MontoPago) FROM pagos WHERE DATE(FechaPago) = ? AND EstadoPago = 'Pagado'), 0) AS EgresosPagados,
        COALESCE((SELECT SUM(MontoPago) FROM pagos WHERE DATE(FechaPago) <= ? AND EstadoPago = 'Pendiente'), 0) AS EgresosPendientes,

        -- Balance del día
        COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                  JOIN turnos t ON c.idTurno = t.idTurno
                  WHERE DATE(c.FechaCobro) = ? AND c.EstadoCobro = 'Cobrado'), 0) 
        - 
        COALESCE((SELECT SUM(MontoPago) FROM pagos WHERE DATE(FechaPago) = ? AND EstadoPago = 'Pagado'), 0) 
        AS BalanceDelDia,

        -- Turnos
        COALESCE((SELECT COUNT(*) FROM turnos WHERE DATE(FechaRequeridaTurno) = ?), 0) AS TurnosProgramados,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE DATE(FechaRequeridaTurno) = ? AND EstadoTurno = 'Finalizado'), 0) AS TurnosAtendidos,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE DATE(FechaRequeridaTurno) = ? AND EstadoTurno = 'Cancelado'), 0) AS TurnosCancelados,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE DATE(FechaRequeridaTurno) = ? AND EstadoTurno = 'Pendiente'), 0) AS TurnosPendientes,

        -- Horas trabajadas
        COALESCE((SELECT SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida) / 60.0)
                  FROM asistencias a WHERE DATE(a.Fecha) = ? AND a.Presente = 1), 0) AS HorasTrabajadasTotales,

        COALESCE((SELECT SUM(GREATEST(0, TIMESTAMPDIFF(MINUTE, HoraSalidaEsperada, HoraSalida) / 60.0))
                  FROM asistencias a
                  JOIN empleados_horarios eh ON a.idEmpleado = eh.idEmpleado
                  JOIN horariosTrabajo h ON eh.idHorario = h.idHorario
                  WHERE DATE(a.Fecha) = ? AND a.HoraSalida > h.HoraSalidaEsperada), 0) AS HorasExtras,

        COALESCE((SELECT COUNT(*) FROM asistencias WHERE DATE(Fecha) = ? AND Presente = 0), 0) AS Ausencias,

        -- Empleado top
        COALESCE((SELECT CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado)
                  FROM asistencias a
                  JOIN empleados e ON a.idEmpleado = e.idEmpleado
                  WHERE DATE(a.Fecha) = ?
                  GROUP BY a.idEmpleado
                  ORDER BY SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida)) DESC LIMIT 1), 'Sin datos') AS EmpleadoTopHoras,

        COALESCE((SELECT SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida) / 60.0)
                  FROM asistencias a
                  WHERE DATE(a.Fecha) = ?
                  GROUP BY a.idEmpleado
                  ORDER BY SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida)) DESC LIMIT 1), 0) AS HorasEmpleadoTop,

        -- Servicio top
        COALESCE((SELECT s.NombreServicio FROM turno_servicios ts
                  JOIN servicios s ON ts.idServicio = s.idServicio
                  JOIN turnos t ON ts.idTurno = t.idTurno
                  WHERE DATE(t.FechaRequeridaTurno) = ?
                  GROUP BY ts.idServicio
                  ORDER BY SUM(ts.Cantidad) DESC LIMIT 1), 'N/A') AS ServicioMasUtilizado,

        COALESCE((SELECT SUM(ts.Cantidad) FROM turno_servicios ts
                  JOIN turnos t ON ts.idTurno = t.idTurno
                  WHERE DATE(t.FechaRequeridaTurno) = ?
                  GROUP BY ts.idServicio
                  ORDER BY SUM(ts.Cantidad) DESC LIMIT 1), 0) AS VecesServicioTop,

        -- Paciente top
        COALESCE((SELECT CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente)
                  FROM turnos t
                  JOIN pacientes p ON t.idPaciente = p.idPaciente
                  WHERE DATE(t.FechaRequeridaTurno) = ?
                  GROUP BY t.idPaciente
                  ORDER BY COUNT(*) DESC LIMIT 1), 'N/A') AS PacienteMasTurnos,

        COALESCE((SELECT COUNT(*) FROM turnos t
                  WHERE DATE(t.FechaRequeridaTurno) = ?
                  GROUP BY t.idPaciente
                  ORDER BY COUNT(*) DESC LIMIT 1), 0) AS TurnosPacienteTop,

        -- Nuevos pacientes
        COALESCE((SELECT COUNT(*) FROM pacientes WHERE DATE(FechaRegistro) = ?), 0) AS NuevosPacientes,

        -- Comentarios y calificación
        COALESCE((SELECT COUNT(*) FROM comentarios WHERE DATE(FechaComentario) = ?), 0) AS ComentariosRecibidos,

        COALESCE((SELECT AVG(CalificacionComentario) FROM comentarios WHERE DATE(FechaComentario) = ?), 0) AS CalificacionPromedio
    `;

    // 23 parámetros (uno por cada ?)
    const params = [
      fechaQuery, // FechaBalance
      fechaQuery, fechaQuery, // Ingresos
      fechaQuery, fechaQuery, // Egresos
      fechaQuery, fechaQuery, // Balance
      fechaQuery, fechaQuery, fechaQuery, fechaQuery, // Turnos
      fechaQuery, // Horas trabajadas
      fechaQuery, // Horas extras
      fechaQuery, // Ausencias
      fechaQuery, // Empleado top nombre
      fechaQuery, // Empleado top horas
      fechaQuery, // Servicio top
      fechaQuery, // Veces servicio top
      fechaQuery, // Paciente top
      fechaQuery, // Turnos paciente top
      fechaQuery, // Nuevos pacientes
      fechaQuery, // Comentarios
      fechaQuery  // Calificación promedio
    ];

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("ERROR SQL MÉTRICAS EN VIVO:", err);
        return res.status(500).json({ 
          error: "Error en la consulta SQL",
          details: err.sqlMessage 
        });
      }
      res.json(result[0] || {});
    });

  } catch (error) {
    console.error("ERROR EN CONTROLADOR:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};