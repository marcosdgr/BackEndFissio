import db from "../../Config/db.js";
import { uploadToCloudinary } from "../../Middlewares/cloudinary.js";
import {
  enviarEmailConfirmacion,
  enviarEmailConfirmacionFinal,
} from "../../Config/mailer.js";

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

      db.query(
        verificarDisponibilidadHorario,
        [FechaRequeridaTurno, HorarioRequeridoTurno],
        async (err, disponibilidadResults) => {
          if (err) {
            console.error("Error al verificar disponibilidad de horario:", err);
            return res.status(500).json({ message: "Error en el servidor" });
          }

          const totalSolicitudes = disponibilidadResults[0].totalSolicitudes;

          if (totalSolicitudes >= 5) {
            return res.status(400).json({
              message:
                "No hay disponibilidad para esa fecha y horario. Máximo 5 turnos por hora.",
              sugerencia: "Por favor, seleccione otro horario disponible.",
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
            [
              FechaRequeridaTurno,
              HorarioRequeridoTurno,
              observaciones,
              idPaciente,
            ],
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

              // Obtener email y datos del paciente para enviar confirmación
              const obtenerDatosPaciente = `
            SELECT u.MailUsuario, p.NombrePaciente, p.ApellidoPaciente
            FROM usuarios u
            INNER JOIN pacientes p ON u.idUsuario = p.idUsuario
            WHERE p.idPaciente = ?
          `;

              db.query(
                obtenerDatosPaciente,
                [idPaciente],
                async (err, pacienteResults) => {
                  if (err) {
                    console.error("Error al obtener datos del paciente:", err);
                  } else if (pacienteResults.length > 0) {
                    // Enviar email de confirmación
                    const emailPaciente = pacienteResults[0].MailUsuario;
                    const datosTurno = {
                      idTurno: turnoId,
                      nombrePaciente: pacienteResults[0].NombrePaciente,
                      apellidoPaciente: pacienteResults[0].ApellidoPaciente,
                      FechaRequeridaTurno: FechaRequeridaTurno,
                      HorarioRequeridoTurno: HorarioRequeridoTurno,
                      mensaje:
                        "Su solicitud será procesada por nuestro personal. Recibirá confirmación pronto.",
                    };

                    try {
                      await enviarEmailConfirmacion(emailPaciente, datosTurno);
                      console.log(
                        `✅ Email de confirmación enviado a: ${emailPaciente}`
                      );
                    } catch (emailError) {
                      console.error(
                        "Error al enviar email de confirmación:",
                        emailError
                      );
                    }
                  }

                  // Respuesta independientemente del resultado del email
                  res.status(201).json({
                    message: "Solicitud de turno enviada exitosamente",
                    idTurno: turnoId,
                    estado: "Solicitado",
                    mensaje:
                      "Su solicitud será procesada por nuestro personal. Recibirá confirmación pronto.",
                    ordenMedicaGuardada: OrdenMedicaURL ? true : false,
                    emailEnviado: pacienteResults.length > 0,
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error en solicitarTurno:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// PASO 1B: Solicitar turno para secretaria (sin orden médica)
export const solicitarTurnoSecretaria = (req, res) => {
  try {
    const {
      FechaRequeridaTurno,
      HorarioRequeridoTurno,
      InformeTurno,
      DNIPaciente, // Cambiado de idPaciente a DNIPaciente
    } = req.body;

    // validaciones similares al método anterior.
    if (!FechaRequeridaTurno || !HorarioRequeridoTurno || !DNIPaciente) {
      return res.status(400).json({
        message: "Fecha, horario y DNI del paciente son requeridos",
      });
    }

    // filtrar pacientes por DNI y estado activo
    const verificarPaciente = `
          SELECT idPaciente, NombrePaciente, ApellidoPaciente, IsActive
          FROM pacientes 
          WHERE DNI = ? AND IsActive = 1
        `;
    db.query(verificarPaciente, [DNIPaciente], (err, results) => {
      if (err) {
        console.error("Error al verificar paciente:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length === 0) {
        return res.status(404).json({ 
          message: "Paciente no encontrado con ese DNI o paciente inactivo" 
        });
      }

      const paciente = results[0];
      const idPaciente = paciente.idPaciente;

      // Verificar disponibilidad de horario (máximo 5 solicitudes por hora)
      const verificarDisponibilidadHorario = `
        SELECT COUNT(*) as totalSolicitudes
        FROM turnos 
        WHERE FechaRequeridaTurno = ? 
          AND HorarioRequeridoTurno = ?
          AND EstadoTurno IN ('Solicitado', 'Pendiente', 'Finalizado')
      `;

      db.query(
        verificarDisponibilidadHorario,
        [FechaRequeridaTurno, HorarioRequeridoTurno],
        (err, disponibilidadResults) => {
          if (err) {
            console.error("Error al verificar disponibilidad de horario:", err);
            return res.status(500).json({ message: "Error en el servidor" });
          }

          const totalSolicitudes = disponibilidadResults[0].totalSolicitudes;

          if (totalSolicitudes >= 5) {
            return res.status(400).json({
              message:
                "No hay disponibilidad para esa fecha y horario. Máximo 5 turnos por hora.",
              sugerencia: "Por favor, seleccione otro horario disponible.",
            });
          }

          // crear solicitud de turno
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
          const observaciones = `SOLICITUD SECRETARIA${
            InformeTurno ? ` | Observaciones: ${InformeTurno}` : ""
          }`;
          
          db.query(
            crearSolicitudQuery,
            [FechaRequeridaTurno, HorarioRequeridoTurno, observaciones, idPaciente],
            (err, results) => {
              if (err) {
                console.error("Error al crear solicitud de turno:", err);
                return res.status(500).json({ message: "Error al solicitar turno" });
              }
              const turnoId = results.insertId;

              res.status(201).json({
                message: "Solicitud de turno creada exitosamente por secretaria",
                idTurno: turnoId,
                paciente: {
                  nombre: `${paciente.NombrePaciente} ${paciente.ApellidoPaciente}`,
                  dni: DNIPaciente
                },
                estado: "Solicitado",
                fecha: FechaRequeridaTurno,
                horario: HorarioRequeridoTurno
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error en solicitarTurnoSecretaria:", error);
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
    ObservacionesSecretaria,
  } = req.body;

  // Validación de campos obligatorios
  if (!HorarioInicioTurno || !HorarioFinTurno || !idEmpleado) {
    return res.status(400).json({
      message: "Horario de inicio, fin y empleado son requeridos",
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

      // Verificar disponibilidad del kinesiólogo
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
            return res.status(500).json({ message: "Error en el servidor" });
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
                  estadoAnterior: "Solicitado",
                  estadoActual: "Pendiente",
                  mensaje: "El paciente ya puede comenzar su sesión",
                },
              });
            }
          );
        }
      );
    });
  });
};

// PASO 3A: Listar turnos del día
export const listarTurnosDelDia = (req, res) => {
  const { fecha } = req.query;

  const fechaConsulta = fecha || "CURDATE()";

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
      e.ApellidoEmpleado
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
    WHERE DATE(t.FechaRequeridaTurno) = ${fecha ? "?" : "CURDATE()"}
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
      solicitados: results.filter((t) => t.EstadoTurno === "Solicitado"),
      enCurso: results.filter((t) => t.EstadoTurno === "Pendiente"),
      finalizados: results.filter((t) => t.EstadoTurno === "Finalizado"),
    };

    res.status(200).json({
      message: "Turnos del día obtenidos exitosamente",
      fechaConsulta: fecha || new Date().toISOString().split("T")[0],
      turnos: turnosPorEstado,
      resumen: {
        total: results.length,
        solicitados: turnosPorEstado.solicitados.length,
        enCurso: turnosPorEstado.enCurso.length,
        finalizados: turnosPorEstado.finalizados.length,
      },
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
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({
      message: "Fecha es requerida",
    });
  }

  const kinesiologosDisponiblesQuery = `
    SELECT 
      e.idEmpleado,
      e.NombreEmpleado,
      e.ApellidoEmpleado,
      c.NombreCat,
      a.HoraEntrada,
      a.Fecha as FechaAsistencia
    FROM empleados e
    INNER JOIN catEmpleados c ON e.idCatEmpleado = c.idCatEmpleado
    INNER JOIN asistencias a ON e.idEmpleado = a.idEmpleado
    WHERE c.NombreCat = 'Kinesiologo' 
      AND e.IsActive = 1
      AND a.Presente = 1
      AND a.Fecha = ?
    ORDER BY e.NombreEmpleado, e.ApellidoEmpleado
  `;

  db.query(kinesiologosDisponiblesQuery, [fecha], (err, results) => {
    if (err) {
      console.error("Error al obtener kinesiólogos disponibles:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    res.status(200).json({
      message: "Kinesiólogos presentes obtenidos exitosamente",
      kinesiologos: results,
      totalPresentes: results.length,
    });
  });
};

// PASO 5: Obtener salas disponibles para una fecha/hora
//  Verificar disponibilidad de horarios para una fecha
export const verificarDisponibilidadHorarios = (req, res) => {
  const { fecha } = req.params; // Formato: YYYY-MM-DD

  // Validar formato de fecha
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({
      message: "Formato de fecha inválido. Use YYYY-MM-DD",
    });
  }

  // Generar todos los horarios posibles (ejemplo: de 8:00 a 18:00, cada hora)
  const horariosCompletos = [];
  for (let hora = 8; hora <= 17; hora++) {
    const horarioFormateado = `${hora.toString().padStart(2, "0")}:00`;
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
    results.forEach((row) => {
      horariosOcupados[row.horario] = {
        totalTurnos: row.totalTurnos,
        disponibles: row.disponibles > 0 ? row.disponibles : 0,
        disponible: row.totalTurnos < 5,
      };
    });

    // Generar respuesta completa con todos los horarios
    const horariosDisponibilidad = horariosCompletos.map((horario) => {
      const ocupacion = horariosOcupados[horario] || horariosOcupados[horario + ":00"];
      return {
        horario: horario,
        horarioCompleto: horario + ":00",
        totalTurnos: ocupacion ? ocupacion.totalTurnos : 0,
        disponibles: ocupacion ? ocupacion.disponibles : 5,
        disponible: ocupacion ? ocupacion.disponible : true,
        label: `${horario} (${ocupacion ? ocupacion.disponibles : 5} disponibles)`
      };
    });

    // Filtrar solo horarios disponibles para el desplegable
    const horariosParaSelect = horariosDisponibilidad
      .filter(h => h.disponible)
      .map(h => ({
        value: h.horarioCompleto,
        label: h.label,
        horario: h.horario
      }));

    res.status(200).json({
      message: "Disponibilidad de horarios obtenida exitosamente",
      fecha: fecha,
      horarios: horariosDisponibilidad,
      horariosDisponibles: horariosParaSelect, 
      resumen: {
        totalHorarios: horariosCompletos.length,
        horariosDisponibles: horariosDisponibilidad.filter((h) => h.disponible)
          .length,
        horariosCompletos: horariosDisponibilidad.filter((h) => !h.disponible)
          .length,
      },
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
      e.ApellidoEmpleado
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
    WHERE t.idTurno = ? AND t.EstadoTurno = 'Pendiente'
  `;

  db.query(verificarTurno, [idTurno], (err, results) => {
    if (err) {
      console.error("Error al verificar turno para finalizar:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Turno no encontrado o no está en estado pendiente",
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

    db.query(
      finalizarQuery,
      [observacionesFinal, observacionesFinal, idTurno],
      (err, updateResults) => {
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
            kinesiologo: turno.NombreEmpleado
              ? `${turno.NombreEmpleado} ${turno.ApellidoEmpleado}`
              : null,
            estadoAnterior: "Pendiente",
            estadoActual: "Finalizado",
            fechaFinalizacion: new Date().toISOString(),
          },
        });
      }
    );
  });
};
