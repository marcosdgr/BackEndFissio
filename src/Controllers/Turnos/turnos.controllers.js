import db from "../../Config/db.js";
import { uploadToCloudinary } from "../../Middlewares/cloudinary.js";
import { enviarEmailConfirmacion, enviarEmailConfirmacionFinal } from "../../Config/mailer.js";

// PASO 1: Solicitar turno desde la web (Paciente)
export const solicitarTurno = async (req, res) => {
  const {
    FechaRequeridaTurno,
    HorarioRequeridoTurno,
    InformeTurno,
    idPaciente,
  } = req.body;

  // obtener imagen de la orden médica
  const ordenMedica = req.file;

  // Validación de campos obligatorios
  if (!FechaRequeridaTurno || !HorarioRequeridoTurno || !idPaciente) {
    return res.status(400).json({
      message: "Fecha, horario y paciente son requeridos",
    });
  }

  try {
    // Verificar que el paciente existe y está activo
    const verificarPaciente = `
    SELECT idPaciente, NombrePaciente, ApellidoPaciente, IsActive
    FROM pacientes 
    WHERE idPaciente = ?
  `;

    db.query(verificarPaciente, [idPaciente], async (err, results) => {
      if (err) {
        console.error("Error al verificar paciente:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      if (!results[0].IsActive) {
        return res.status(400).json({ message: "Paciente inactivo" });
      }

      // Verificar disponibilidad de horario (máximo 5 solicitudes por hora)
      const verificarDisponibilidadHorario = `
        SELECT COUNT(*) as totalSolicitudes
        FROM turnos 
        WHERE FechaRequeridaTurno = ? 
          AND HorarioRequeridoTurno = ?
          AND EstadoTurno IN ('Solicitado', 'Pendiente', 'Finalizado')
      `;

      db.query(verificarDisponibilidadHorario, [FechaRequeridaTurno, HorarioRequeridoTurno], async (err, disponibilidadResults) => {
        if (err) {
          console.error("Error al verificar disponibilidad de horario:", err);
          return res.status(500).json({ message: "Error en el servidor" });
        }

        const totalSolicitudes = disponibilidadResults[0].totalSolicitudes;

        if (totalSolicitudes >= 5) {
          return res.status(400).json({ 
            message: "No hay disponibilidad para esa fecha y horario. Máximo 5 turnos por hora.",
            sugerencia: "Por favor, seleccione otro horario disponible."
          });
        }

        // Subir orden médica a Cloudinary si existe
        let OrdenMedicaURL = null;
        let OrdenMedicaPublicId = null;
      if (ordenMedica) {
        try {
          const resultadoImagen = await uploadToCloudinary(
            ordenMedica.buffer,
            "ordenes_medicas"
          );
          OrdenMedicaURL = resultadoImagen.secure_url;
          OrdenMedicaPublicId = resultadoImagen.public_id;
        } catch (error) {
          console.error("Error al subir orden médica a Cloudinary:", error);
          return res
            .status(500)
            .json({ message: "Error al subir orden médica" });
        }
      }

      // Crear solicitud de turno sin asignar empleado ni sala (quedan NULL)
      // La secretaria los asignará después
      const crearSolicitudQuery = `
      INSERT INTO turnos (
        FechaSolicitudTurno, 
        FechaRequeridaTurno, 
        HorarioRequeridoTurno,
        InformeTurno,
        EstadoTurno,
        idPaciente
      ) VALUES (CURDATE(), ?, ?, ?, 'Solicitado', ?)
    `;

      const observaciones = `SOLICITUD WEB${
        InformeTurno ? ` | Observaciones: ${InformeTurno}` : ""
      }${OrdenMedicaURL ? ` | Orden médica: ${OrdenMedicaURL}` : ""}`;

      db.query(
        crearSolicitudQuery,
        [FechaRequeridaTurno, HorarioRequeridoTurno, observaciones, idPaciente],
        (err, results) => {
          if (err) {
            console.error("Error al crear solicitud de turno:", err);
            return res
              .status(500)
              .json({ message: "Error al solicitar turno" });
          }

          const turnoId = results.insertId;

          // Si hay orden médica, también guardarla en estudios_paciente
          if (OrdenMedicaURL) {
            const insertarEstudioQuery = `
              INSERT INTO estudios_paciente (
                idPaciente, 
                ArchivoURL, 
                FechaEstudio, 
                Descripcion
              ) VALUES (?, ?, NOW(), ?)
            `;

            const descripcionEstudio = `Orden médica - Solicitud de turno #${turnoId}${
              InformeTurno ? ` | ${InformeTurno}` : ""
            }`;

            db.query(
              insertarEstudioQuery,
              [idPaciente, OrdenMedicaURL, descripcionEstudio],
              (err, estudioResults) => {
                if (err) {
                  console.error(
                    "Error al guardar orden médica en estudios:",
                    err
                  );
                  // No retornamos error aquí porque el turno ya se creó exitosamente
                }
              }
            );
          }

          // Obtener email del paciente para enviar confirmación
          const obtenerEmailPaciente = `
            SELECT u.MailUsuario
            FROM usuarios u
            INNER JOIN pacientes p ON u.idUsuario = p.idUsuario
            WHERE p.idPaciente = ?
          `;

          db.query(obtenerEmailPaciente, [idPaciente], async (err, emailResults) => {
            if (err) {
              console.error("Error al obtener email del paciente:", err);
            } else if (emailResults.length > 0) {
              // Enviar email de confirmación
              const emailPaciente = emailResults[0].MailUsuario;
              const datosTurno = {
                idTurno: turnoId,
                nombrePaciente: results[0].NombrePaciente,
                apellidoPaciente: results[0].ApellidoPaciente,
                FechaRequeridaTurno: FechaRequeridaTurno,
                HorarioRequeridoTurno: HorarioRequeridoTurno,
                mensaje: "Su solicitud será procesada por nuestro personal. Recibirá confirmación pronto."
              };

              try {
                await enviarEmailConfirmacion(emailPaciente, datosTurno);
                console.log(`✅ Email de confirmación enviado a: ${emailPaciente}`);
              } catch (emailError) {
                console.error("Error al enviar email de confirmación:", emailError);
              }
            }

            // Respuesta independientemente del resultado del email
            res.status(201).json({
              message: "Solicitud de turno enviada exitosamente",
              idTurno: turnoId,
              estado: "Solicitado",
              mensaje: "Su solicitud será procesada por nuestro personal. Recibirá confirmación pronto.",
              ordenMedicaGuardada: OrdenMedicaURL ? true : false,
              emailEnviado: emailResults.length > 0
            });
          });
        }
      );
      }); // Cerrar callback de verificarDisponibilidadHorario
    }); // Cerrar callback de verificarPaciente
  } catch (error) {
    console.error("Error en solicitarTurno:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// PASO 2: Asignar recursos el día del turno (Secretaria - cuando paciente se presenta)
export const asignarRecursosDelDia = (req, res) => {
  const { idTurno } = req.params;
  const {
    HorarioInicioTurno,
    HorarioFinTurno,
    idEmpleado, // Kinesiólogo asignado
    idSala,
    ObservacionesSecretaria,
  } = req.body;

  // Validación de campos obligatorios
  if (!HorarioInicioTurno || !HorarioFinTurno || !idEmpleado || !idSala) {
    return res.status(400).json({
      message: "Horario de inicio, fin, empleado y sala son requeridos",
    });
  }

  // Verificar que el turno existe, está en estado 'Solicitado' y es para HOY
  const verificarTurno = `
    SELECT t.*, p.NombrePaciente, p.ApellidoPaciente
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    WHERE t.idTurno = ? 
      AND t.EstadoTurno = 'Solicitado' 
      AND DATE(t.FechaRequeridaTurno) = CURDATE()
      AND t.InformeTurno LIKE 'SOLICITUD WEB%'
  `;

  db.query(verificarTurno, [idTurno], (err, turnoResults) => {
    if (err) {
      console.error("Error al verificar turno:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (turnoResults.length === 0) {
      return res.status(404).json({
        message: "Turno no encontrado, ya fue procesado, o no es para hoy",
      });
    }
    const turno = turnoResults[0];

    // Verificar que el empleado es kinesiólogo y está activo
    const verificarKinesiologo = `
      SELECT e.idEmpleado, e.NombreEmpleado, e.ApellidoEmpleado, 
             c.NombreCat, e.IsActive
      FROM empleados e
      INNER JOIN catEmpleados c ON e.idCatEmpleado = c.idCatEmpleado
      WHERE e.idEmpleado = ? AND c.NombreCat = 'Kinesiologo'
    `;

    db.query(verificarKinesiologo, [idEmpleado], (err, empleadoResults) => {
      if (err) {
        console.error("Error al verificar kinesiólogo:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (empleadoResults.length === 0) {
        return res.status(400).json({
          message: "El empleado seleccionado no es un kinesiólogo válido",
        });
      }

      if (!empleadoResults[0].IsActive) {
        return res.status(400).json({
          message: "El kinesiólogo no está activo",
        });
      }

      // Verificar disponibilidad de sala (solo turnos ya procesados con horarios asignados)
      const verificarDisponibilidadSala = `
        SELECT idTurno 
        FROM turnos 
        WHERE idSala = ? 
          AND FechaRequeridaTurno = ? 
          AND EstadoTurno IN ('Pendiente', 'Finalizado')
          AND HorarioInicioTurno IS NOT NULL
          AND HorarioFinTurno IS NOT NULL
          AND (
            (HorarioInicioTurno < ? AND HorarioFinTurno > ?) OR
            (HorarioInicioTurno < ? AND HorarioFinTurno > ?) OR
            (HorarioInicioTurno >= ? AND HorarioFinTurno <= ?)
          )
      `;

      db.query(
        verificarDisponibilidadSala,
        [
          idSala,
          turno.FechaRequeridaTurno,
          HorarioFinTurno,
          HorarioInicioTurno,
          HorarioFinTurno,
          HorarioInicioTurno,
          HorarioInicioTurno,
          HorarioFinTurno,
        ],
        (err, salaResults) => {
          if (err) {
            console.error("Error al verificar disponibilidad de sala:", err);
            return res.status(500).json({ message: "Error en el servidor" });
          }

          if (salaResults.length > 0) {
            return res.status(400).json({
              message: "La sala no está disponible en el horario seleccionado",
            });
          }

          // Verificar disponibilidad del kinesiólogo (solo turnos ya procesados con horarios asignados)
          const verificarDisponibilidadEmpleado = `
            SELECT idTurno 
            FROM turnos 
            WHERE idEmpleado = ? 
              AND FechaRequeridaTurno = ? 
              AND EstadoTurno IN ('Pendiente', 'Finalizado')
              AND HorarioInicioTurno IS NOT NULL
              AND HorarioFinTurno IS NOT NULL
              AND (
                (HorarioInicioTurno < ? AND HorarioFinTurno > ?) OR
                (HorarioInicioTurno < ? AND HorarioFinTurno > ?) OR
                (HorarioInicioTurno >= ? AND HorarioFinTurno <= ?)
              )
          `;
          db.query(
            verificarDisponibilidadEmpleado,
            [
              idEmpleado,
              turno.FechaRequeridaTurno,
              HorarioFinTurno,
              HorarioInicioTurno,
              HorarioFinTurno,
              HorarioInicioTurno,
              HorarioInicioTurno,
              HorarioFinTurno,
            ],
            (err, empleadoDisponibleResults) => {
              if (err) {
                console.error(
                  "Error al verificar disponibilidad del empleado:",
                  err
                );
                return res
                  .status(500)
                  .json({ message: "Error en el servidor" });
              }

              if (empleadoDisponibleResults.length > 0) {
                return res.status(400).json({
                  message:
                    "El kinesiólogo no está disponible en el horario seleccionado",
                });
              }

              // Actualizar turno con asignaciones
              const actualizarTurno = `
            UPDATE turnos 
            SET HorarioInicioTurno = ?,
                HorarioFinTurno = ?,
                idEmpleado = ?,
                idSala = ?,
                EstadoTurno = 'Pendiente',
                InformeTurno = CONCAT(
                  COALESCE(InformeTurno, ''), 
                  CASE WHEN InformeTurno IS NOT NULL THEN ' | ' ELSE '' END,
                  'Procesado por secretaria',
                  CASE WHEN ? IS NOT NULL THEN CONCAT(' | Obs. secretaria: ', ?) ELSE '' END
                )
            WHERE idTurno = ?
          `;

              db.query(
                actualizarTurno,
                [
                  HorarioInicioTurno,
                  HorarioFinTurno,
                  idEmpleado,
                  idSala,
                  ObservacionesSecretaria,
                  ObservacionesSecretaria,
                  idTurno,
                ],
                (err, results) => {
                  if (err) {
                    console.error("Error al procesar turno:", err);
                    return res
                      .status(500)
                      .json({ message: "Error al procesar turno" });
                  }

                  res.status(200).json({
                    message: "Recursos asignados exitosamente - Turno en curso",
                    turno: {
                      idTurno: idTurno,
                      paciente: `${turno.NombrePaciente} ${turno.ApellidoPaciente}`,
                      fecha: turno.FechaRequeridaTurno,
                      horario: `${HorarioInicioTurno} - ${HorarioFinTurno}`,
                      kinesiologo: `${empleadoResults[0].NombreEmpleado} ${empleadoResults[0].ApellidoEmpleado}`,
                      sala: idSala,
                      estadoAnterior: "Solicitado",
                      estadoActual: "Pendiente",
                      mensaje: "El paciente ya puede comenzar su sesión"
                    }
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

// PASO 3A: Listar turnos del día (Para que secretaria vea quién viene HOY)
export const listarTurnosDelDia = (req, res) => {
  const { fecha } = req.query; // Opcional: específica fecha, por defecto HOY
  
  const fechaConsulta = fecha || 'CURDATE()';
  
  const turnosDelDiaQuery = `
    SELECT 
      t.idTurno,
      t.FechaSolicitudTurno,
      t.FechaRequeridaTurno,
      t.HorarioRequeridoTurno,
      t.HorarioInicioTurno,
      t.HorarioFinTurno,
      t.InformeTurno,
      t.EstadoTurno,
      p.idPaciente,
      p.NombrePaciente,
      p.ApellidoPaciente,
      p.TelefonoPaciente,
      p.DNI,
      e.NombreEmpleado,
      e.ApellidoEmpleado,
      s.NombreSala
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
    LEFT JOIN salas s ON t.idSala = s.idSala
    WHERE DATE(t.FechaRequeridaTurno) = ${fecha ? '?' : 'CURDATE()'}
      AND t.EstadoTurno IN ('Solicitado', 'Pendiente', 'Finalizado')
    ORDER BY t.HorarioRequeridoTurno ASC, t.EstadoTurno ASC
  `;

  const params = fecha ? [fecha] : [];

  db.query(turnosDelDiaQuery, params, (err, results) => {
    if (err) {
      console.error("Error al obtener turnos del día:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    // Organizar por estado
    const turnosPorEstado = {
      solicitados: results.filter(t => t.EstadoTurno === 'Solicitado'),
      enCurso: results.filter(t => t.EstadoTurno === 'Pendiente'),
      finalizados: results.filter(t => t.EstadoTurno === 'Finalizado')
    };

    res.status(200).json({
      message: "Turnos del día obtenidos exitosamente",
      fecha: fecha || new Date().toISOString().split('T')[0],
      turnos: turnosPorEstado,
      resumen: {
        total: results.length,
        solicitados: turnosPorEstado.solicitados.length,
        enCurso: turnosPorEstado.enCurso.length,
        finalizados: turnosPorEstado.finalizados.length
      }
    });
  });
};

// PASO 3B: Listar solicitudes pendientes históricas (Para la secretaria)
export const listarSolicitudesPendientes = (req, res) => {
  const solicitudesPendientesQuery = `
    SELECT 
      t.idTurno,
      t.FechaSolicitudTurno,
      t.FechaRequeridaTurno,
      t.HorarioRequeridoTurno,
      t.InformeTurno as InformeTurno,
      t.EstadoTurno,
      p.idPaciente,
      p.NombrePaciente,
      p.ApellidoPaciente,
      p.TelefonoPaciente,
      p.DNI
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    WHERE t.EstadoTurno = 'Solicitado' 
      AND t.InformeTurno LIKE 'SOLICITUD WEB%'
    ORDER BY t.FechaSolicitudTurno ASC, t.HorarioRequeridoTurno ASC
  `;

  db.query(solicitudesPendientesQuery, (err, results) => {
    if (err) {
      console.error("Error al obtener solicitudes pendientes:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    res.status(200).json({
      message: "Solicitudes pendientes obtenidas exitosamente",
      solicitudes: results,
      total: results.length,
    });
  });
};

// PASO 4: Obtener kinesiólogos disponibles para una fecha/hora
export const obtenerKinesiologosDisponibles = (req, res) => {
  const { fecha, horaInicio, horaFin } = req.query;

  if (!fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Fecha, hora de inicio y fin son requeridas",
    });
  }

  const kinesiologosDisponiblesQuery = `
    SELECT 
      e.idEmpleado,
      e.NombreEmpleado,
      e.ApellidoEmpleado,
      c.NombreCat
    FROM empleados e
    INNER JOIN catEmpleados c ON e.idCatEmpleado = c.idCatEmpleado
    WHERE c.NombreCat = 'Kinesiologo' 
      AND e.IsActive = 1
      AND e.idEmpleado NOT IN (
        SELECT t.idEmpleado 
        FROM turnos t 
        WHERE t.FechaRequeridaTurno = ?
          AND t.EstadoTurno IN ('Pendiente', 'Finalizado')
          AND t.idEmpleado IS NOT NULL
          AND t.HorarioInicioTurno IS NOT NULL
          AND t.HorarioFinTurno IS NOT NULL
          AND (
            (t.HorarioInicioTurno < ? AND t.HorarioFinTurno > ?) OR
            (t.HorarioInicioTurno < ? AND t.HorarioFinTurno > ?) OR
            (t.HorarioInicioTurno >= ? AND t.HorarioFinTurno <= ?)
          )
      )
    ORDER BY e.NombreEmpleado, e.ApellidoEmpleado
  `;

  db.query(
    kinesiologosDisponiblesQuery,
    [fecha, horaFin, horaInicio, horaFin, horaInicio, horaInicio, horaFin],
    (err, results) => {
      if (err) {
        console.error("Error al obtener kinesiólogos disponibles:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      res.status(200).json({
        message: "Kinesiólogos disponibles obtenidos exitosamente",
        kinesiologos: results,
      });
    }
  );
};

// PASO 5: Obtener salas disponibles para una fecha/hora
export const obtenerSalasDisponibles = (req, res) => {
  const { fecha, horaInicio, horaFin } = req.query;

  if (!fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      message: "Fecha, hora de inicio y fin son requeridas",
    });
  }

  const salasDisponiblesQuery = `
    SELECT 
      s.idSala,
      s.NombreSala,
      s.Capacidad
    FROM salas s
    WHERE s.IsActive = 1
      AND s.idSala NOT IN (
        SELECT t.idSala 
        FROM turnos t 
        WHERE t.FechaRequeridaTurno = ?
          AND t.EstadoTurno IN ('Pendiente', 'Finalizado')
          AND t.idSala IS NOT NULL
          AND t.HorarioInicioTurno IS NOT NULL
          AND t.HorarioFinTurno IS NOT NULL
          AND (
            (t.HorarioInicioTurno < ? AND t.HorarioFinTurno > ?) OR
            (t.HorarioInicioTurno < ? AND t.HorarioFinTurno > ?) OR
            (t.HorarioInicioTurno >= ? AND t.HorarioFinTurno <= ?)
          )
      )
    ORDER BY s.NombreSala
  `;

  db.query(
    salasDisponiblesQuery,
    [fecha, horaFin, horaInicio, horaFin, horaInicio, horaInicio, horaFin],
    (err, results) => {
      if (err) {
        console.error("Error al obtener salas disponibles:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      res.status(200).json({
        message: "Salas disponibles obtenidas exitosamente",
        salas: results,
      });
    }
  );
};

//  Verificar disponibilidad de horarios para una fecha
export const verificarDisponibilidadHorarios = (req, res) => {
  const { fecha } = req.params; // Formato: YYYY-MM-DD

  // Validar formato de fecha
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ 
      message: "Formato de fecha inválido. Use YYYY-MM-DD" 
    });
  }

  // Generar todos los horarios posibles (ejemplo: de 8:00 a 18:00, cada hora)
  const horariosCompletos = [];
  for (let hora = 8; hora <= 17; hora++) {
    const horarioFormateado = `${hora.toString().padStart(2, '0')}:00:00`;
    horariosCompletos.push(horarioFormateado);
  }

  // Consultar cuántos turnos hay por cada horario
  const consultarDisponibilidad = `
    SELECT 
      HorarioRequeridoTurno as horario,
      COUNT(*) as totalTurnos,
      (5 - COUNT(*)) as disponibles
    FROM turnos 
    WHERE FechaRequeridaTurno = ? 
      AND EstadoTurno IN ('Solicitado', 'Pendiente', 'Finalizado')
    GROUP BY HorarioRequeridoTurno
  `;

  db.query(consultarDisponibilidad, [fecha], (err, results) => {
    if (err) {
      console.error("Error al verificar disponibilidad de horarios:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    // Crear mapa de horarios ocupados
    const horariosOcupados = {};
    results.forEach(row => {
      horariosOcupados[row.horario] = {
        totalTurnos: row.totalTurnos,
        disponibles: row.disponibles > 0 ? row.disponibles : 0,
        disponible: row.totalTurnos < 5
      };
    });

    // Generar respuesta completa con todos los horarios
    const horariosDisponibilidad = horariosCompletos.map(horario => {
      const ocupacion = horariosOcupados[horario];
      return {
        horario: horario,
        totalTurnos: ocupacion ? ocupacion.totalTurnos : 0,
        disponibles: ocupacion ? ocupacion.disponibles : 5,
        disponible: ocupacion ? ocupacion.disponible : true
      };
    });

    res.status(200).json({
      message: "Disponibilidad de horarios obtenida exitosamente",
      fecha: fecha,
      horarios: horariosDisponibilidad,
      resumen: {
        totalHorarios: horariosCompletos.length,
        horariosDisponibles: horariosDisponibilidad.filter(h => h.disponible).length,
        horariosCompletos: horariosDisponibilidad.filter(h => !h.disponible).length
      }
    });
  });
};

// FUNCIÓN: Finalizar turno (cambiar estado a finalizado)
export const finalizarTurno = (req, res) => {
  const { idTurno } = req.params;
  const { observacionesFinal, idEmpleado } = req.body;

  // Validar que el turno existe y está en estado 'Pendiente'
  const verificarTurno = `
    SELECT 
      t.*,
      p.NombrePaciente,
      p.ApellidoPaciente,
      e.NombreEmpleado,
      e.ApellidoEmpleado,
      s.NombreSala
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
    LEFT JOIN salas s ON t.idSala = s.idSala
    WHERE t.idTurno = ? AND t.EstadoTurno = 'Pendiente'
  `;

  db.query(verificarTurno, [idTurno], (err, results) => {
    if (err) {
      console.error("Error al verificar turno para finalizar:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Turno no encontrado o no está en estado pendiente"
      });
    }

    const turno = results[0];

    // Actualizar el turno a finalizado
    const finalizarQuery = `
      UPDATE turnos 
      SET 
        EstadoTurno = 'Finalizado',
        InformeTurno = CONCAT(
          COALESCE(InformeTurno, ''), 
          ' | Finalizado el ', NOW(),
          CASE WHEN ? IS NOT NULL THEN CONCAT(' | Observaciones finales: ', ?) ELSE '' END
        )
      WHERE idTurno = ?
    `;

    db.query(finalizarQuery, [observacionesFinal, observacionesFinal, idTurno], (err, updateResults) => {
      if (err) {
        console.error("Error al finalizar turno:", err);
        return res.status(500).json({ message: "Error al finalizar turno" });
      }

      res.status(200).json({
        message: "Turno finalizado exitosamente",
        turno: {
          idTurno: idTurno,
          paciente: `${turno.NombrePaciente} ${turno.ApellidoPaciente}`,
          fecha: turno.FechaRequeridaTurno,
          horario: `${turno.HorarioInicioTurno} - ${turno.HorarioFinTurno}`,
          kinesiologo: turno.NombreEmpleado ? `${turno.NombreEmpleado} ${turno.ApellidoEmpleado}` : null,
          sala: turno.NombreSala,
          estadoAnterior: "Pendiente",
          estadoActual: "Finalizado",
          fechaFinalizacion: new Date().toISOString()
        }
      });
    });
  });
};
