import db from "../../Config/db.js";

export const obtenerMetricasEnVivo = async (req, res) => {
  const { tipo = 'dia', fecha } = req.query;

  let fechaInicio, fechaFin;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (tipo === 'dia') {
    const fechaDia = fecha ? new Date(fecha) : hoy;
    fechaInicio = fechaDia;
    fechaFin = fechaDia;
  } else if (tipo === 'semana') {
    const fechaRef = fecha ? new Date(fecha) : hoy;
    const diaSemana = fechaRef.getDay();
    const inicioSemana = new Date(fechaRef);
    inicioSemana.setDate(fechaRef.getDate() - diaSemana); 
    inicioSemana.setHours(0, 0, 0, 0);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    fechaInicio = inicioSemana;
    fechaFin = finSemana;
  } else if (tipo === 'mes') {
    const fechaRef = fecha ? new Date(fecha) : hoy;
    const año = fechaRef.getFullYear();
    const mes = fechaRef.getMonth();
    fechaInicio = new Date(año, mes, 1);
    fechaFin = new Date(año, mes + 1, 0, 23, 59, 59, 999);
  } else {
    return res.status(400).json({ error: "Tipo inválido. Usa: dia, semana, mes" });
  }

  const inicioStr = fechaInicio.toISOString().split('T')[0];
  const finStr = fechaFin.toISOString().split('T')[0];
  const fechaBalance = tipo === 'dia' ? inicioStr : `${inicioStr} al ${finStr}`;

  try {
    const query = `
      SELECT 
        ? AS FechaBalance,
        ? AS TipoRango,

        -- Ingresos
        COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                  JOIN turnos t ON c.idTurno = t.idTurno
                  WHERE c.FechaCobro >= ? AND c.FechaCobro <= ? AND c.EstadoCobro = 'Cobrado'), 0) AS IngresosCobrados,

        COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                  JOIN turnos t ON c.idTurno = t.idTurno
                  WHERE c.FechaCobro <= ? AND c.EstadoCobro = 'Pendiente'), 0) AS IngresosPendientes,

        -- Egresos
        COALESCE((SELECT SUM(MontoPago) FROM pagos 
                  WHERE FechaPago >= ? AND FechaPago <= ? AND EstadoPago = 'Pagado'), 0) AS EgresosPagados,

        COALESCE((SELECT SUM(MontoPago) FROM pagos 
                  WHERE FechaPago <= ? AND EstadoPago = 'Pendiente'), 0) AS EgresosPendientes,

        -- Balance
        (COALESCE((SELECT SUM(MontoCobro) FROM cobros c
                   JOIN turnos t ON c.idTurno = t.idTurno
                   WHERE c.FechaCobro >= ? AND c.FechaCobro <= ? AND c.EstadoCobro = 'Cobrado'), 0)
         -
         COALESCE((SELECT SUM(MontoPago) FROM pagos 
                   WHERE FechaPago >= ? AND FechaPago <= ? AND EstadoPago = 'Pagado'), 0)) AS BalanceDelDia,

        -- Turnos
        COALESCE((SELECT COUNT(*) FROM turnos WHERE FechaRequeridaTurno >= ? AND FechaRequeridaTurno <= ?), 0) AS TurnosProgramados,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE FechaRequeridaTurno >= ? AND FechaRequeridaTurno <= ? AND EstadoTurno = 'Finalizado'), 0) AS TurnosAtendidos,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE FechaRequeridaTurno >= ? AND FechaRequeridaTurno <= ? AND EstadoTurno = 'Cancelado'), 0) AS TurnosCancelados,
        COALESCE((SELECT COUNT(*) FROM turnos WHERE FechaRequeridaTurno >= ? AND FechaRequeridaTurno <= ? AND EstadoTurno = 'Pendiente'), 0) AS TurnosPendientes,

        -- Horas trabajadas
        COALESCE((SELECT SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida) / 60.0)
                  FROM asistencias a WHERE a.Fecha >= ? AND a.Fecha <= ? AND a.Presente = 1), 0) AS HorasTrabajadasTotales,

        COALESCE((SELECT SUM(GREATEST(0, TIMESTAMPDIFF(MINUTE, HoraSalidaEsperada, HoraSalida) / 60.0))
                  FROM asistencias a
                  JOIN empleados_horarios eh ON a.idEmpleado = eh.idEmpleado
                  JOIN horariosTrabajo h ON eh.idHorario = h.idHorario
                  WHERE a.Fecha >= ? AND a.Fecha <= ? AND a.HoraSalida > h.HoraSalidaEsperada), 0) AS HorasExtras,

        COALESCE((SELECT COUNT(*) FROM asistencias WHERE Fecha >= ? AND Fecha <= ? AND Presente = 0), 0) AS Ausencias,

        -- Empleado top
        COALESCE((SELECT CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado)
                  FROM asistencias a
                  JOIN empleados e ON a.idEmpleado = e.idEmpleado
                  WHERE a.Fecha >= ? AND a.Fecha <= ?
                  GROUP BY a.idEmpleado
                  ORDER BY SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida)) DESC LIMIT 1), 'Sin datos') AS EmpleadoTopHoras,

        COALESCE((SELECT SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida) / 60.0)
                  FROM asistencias a
                  WHERE a.Fecha >= ? AND a.Fecha <= ?
                  GROUP BY a.idEmpleado
                  ORDER BY SUM(TIMESTAMPDIFF(MINUTE, HoraEntrada, HoraSalida)) DESC LIMIT 1), 0) AS HorasEmpleadoTop,

        -- Servicio top
        COALESCE((SELECT s.NombreServicio FROM turno_servicios ts
                  JOIN servicios s ON ts.idServicio = s.idServicio
                  JOIN turnos t ON ts.idTurno = t.idTurno
                  WHERE t.FechaRequeridaTurno >= ? AND t.FechaRequeridaTurno <= ?
                  GROUP BY ts.idServicio
                  ORDER BY SUM(ts.Cantidad) DESC LIMIT 1), 'N/A') AS ServicioMasUtilizado,

        COALESCE((SELECT SUM(ts.Cantidad) FROM turno_servicios ts
                  JOIN turnos t ON ts.idTurno = t.idTurno
                  WHERE t.FechaRequeridaTurno >= ? AND t.FechaRequeridaTurno <= ?
                  GROUP BY ts.idServicio
                  ORDER BY SUM(ts.Cantidad) DESC LIMIT 1), 0) AS VecesServicioTop,

        -- Paciente top
        COALESCE((SELECT CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente)
                  FROM turnos t
                  JOIN pacientes p ON t.idPaciente = p.idPaciente
                  WHERE t.FechaRequeridaTurno >= ? AND t.FechaRequeridaTurno <= ?
                  GROUP BY t.idPaciente
                  ORDER BY COUNT(*) DESC LIMIT 1), 'N/A') AS PacienteMasTurnos,

        COALESCE((SELECT COUNT(*) FROM turnos t
                  WHERE t.FechaRequeridaTurno >= ? AND t.FechaRequeridaTurno <= ?
                  GROUP BY t.idPaciente
                  ORDER BY COUNT(*) DESC LIMIT 1), 0) AS TurnosPacienteTop,

        -- Nuevos pacientes
        COALESCE((SELECT COUNT(*) FROM pacientes WHERE FechaRegistro >= ? AND FechaRegistro <= ?), 0) AS NuevosPacientes,

        -- Comentarios
        COALESCE((SELECT COUNT(*) FROM comentarios WHERE FechaComentario >= ? AND FechaComentario <= ?), 0) AS ComentariosRecibidos,
        COALESCE((SELECT AVG(CalificacionComentario) FROM comentarios WHERE FechaComentario >= ? AND FechaComentario <= ?), 0) AS CalificacionPromedio
    `;

    const params = [
      fechaBalance, tipo, // FechaBalance y TipoRango
      inicioStr, finStr, finStr, // Ingresos
      inicioStr, finStr, finStr, // Egresos
      inicioStr, finStr, inicioStr, finStr, // Balance
      inicioStr, finStr, inicioStr, finStr, inicioStr, finStr, inicioStr, finStr, // Turnos
      inicioStr, finStr, // Horas totales
      inicioStr, finStr, // Horas extras
      inicioStr, finStr, // Ausencias
      inicioStr, finStr, // Empleado top nombre
      inicioStr, finStr, // Empleado top horas
      inicioStr, finStr, // Servicio top
      inicioStr, finStr, // Veces servicio
      inicioStr, finStr, // Paciente top
      inicioStr, finStr, // Turnos paciente
      inicioStr, finStr, // Nuevos pacientes
      inicioStr, finStr, // Comentarios
      inicioStr, finStr  // Calificación
    ];

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("ERROR SQL MÉTRICAS:", err);
        return res.status(500).json({ error: "Error en consulta", details: err.sqlMessage });
      }
      res.json(result[0] || {});
    });
  } catch (error) {
    console.error("ERROR CONTROLADOR:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};