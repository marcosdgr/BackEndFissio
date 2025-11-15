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
    if (
      !FechaRequeridaTurno ||
      !HorarioRequeridoTurno ||
      !DNIPaciente ||
      !InformeTurno
    ) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
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
          message: "Paciente no encontrado con ese DNI o paciente inactivo",
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

              res.status(201).json({
                message:
                  "Solicitud de turno creada exitosamente por secretaria",
                idTurno: turnoId,
                paciente: {
                  nombre: `${paciente.NombrePaciente} ${paciente.ApellidoPaciente}`,
                  dni: DNIPaciente,
                },
                estado: "Solicitado",
                fecha: FechaRequeridaTurno,
                horario: HorarioRequeridoTurno,
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
  console.log(idTurno);
  const {
    HorarioInicioTurno,
    HorarioFinTurno,
    idEmpleado, // Kinesiólogo asignado
    ObservacionesSecretaria,
  } = req.body;
console.log(req.body);
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
      AND (t.InformeTurno LIKE 'SOLICITUD WEB%' OR t.InformeTurno LIKE 'SOLICITUD SECRETARIA%')
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
      AND t.EstadoTurno IN ('Solicitado', 'Pendiente', 'Finalizado', 'Cancelado')
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
      cancelados: results.filter((t) => t.EstadoTurno === "Cancelado"),
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
        cancelados: turnosPorEstado.cancelados.length,
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

// PASO 5: Verificar disponibilidad de horarios para una fecha (usa tabla horarios_turnos)
export const verificarDisponibilidadHorarios = (req, res) => {
  const { fecha } = req.params; // Formato: YYYY-MM-DD

  // Validar formato de fecha
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({
      message: "Formato de fecha inválido. Use YYYY-MM-DD",
    });
  }

  // Calcular el día de la semana (1=Lunes, 7=Domingo)
  const fechaObj = new Date(fecha + 'T00:00:00');
  const diaSemana = fechaObj.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const diaSemanaAjustado = diaSemana === 0 ? 7 : diaSemana; // Convertir a 1-7

  // Obtener los horarios configurados para ese día de la semana
  const obtenerHorariosQuery = `
    SELECT 
      idHorario,
      HoraInicio,
      HoraFin,
      CupoPorHora
    FROM horarios_turnos
    WHERE DiaSemana = ? AND IsActive = 1
    ORDER BY HoraInicio ASC
  `;

  db.query(obtenerHorariosQuery, [diaSemanaAjustado], (err, horariosConfig) => {
    if (err) {
      console.error("Error al obtener horarios configurados:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (horariosConfig.length === 0) {
      return res.status(200).json({
        message: "No hay horarios configurados para este día",
        fecha: fecha,
        diaSemana: diaSemanaAjustado,
        horarios: [],
        horariosDisponibles: [],
        resumen: {
          totalHorarios: 0,
          horariosDisponibles: 0,
          horariosCompletos: 0,
        },
      });
    }

    // Generar todos los horarios hora por hora según la configuración
    // Usar un Map para evitar duplicados (sin sumar cupos)
    const horariosMap = new Map();
    
    horariosConfig.forEach((config) => {
      const horaInicio = parseInt(config.HoraInicio.split(':')[0]);
      const horaFin = parseInt(config.HoraFin.split(':')[0]);
      
      for (let hora = horaInicio; hora < horaFin; hora++) {
        const horarioFormateado = `${hora.toString().padStart(2, "0")}:00`;
        
        // Solo agregar si no existe (ignora duplicados)
        if (!horariosMap.has(horarioFormateado)) {
          horariosMap.set(horarioFormateado, {
            horario: horarioFormateado,
            cupoMaximo: config.CupoPorHora
          });
        }
      }
    });
    
    // Convertir el Map a array y ordenar por horario
    const horariosCompletos = Array.from(horariosMap.values()).sort((a, b) => 
      a.horario.localeCompare(b.horario)
    );

    // Consultar cuántos turnos hay por cada horario
    const consultarDisponibilidad = `
      SELECT 
        HorarioRequeridoTurno as horario,
        COUNT(*) as totalTurnos
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
        const horarioKey = row.horario.substring(0, 5); // Formato HH:mm
        horariosOcupados[horarioKey] = row.totalTurnos;
      });

      // Generar respuesta completa con todos los horarios
      const horariosDisponibilidad = horariosCompletos.map((item) => {
        const totalTurnos = horariosOcupados[item.horario] || 0;
        const disponibles = item.cupoMaximo - totalTurnos;
        const disponible = disponibles > 0;

        return {
          horario: item.horario,
          horarioCompleto: item.horario + ":00",
          totalTurnos: totalTurnos,
          cupoMaximo: item.cupoMaximo,
          disponibles: disponibles > 0 ? disponibles : 0,
          disponible: disponible,
          label: `${item.horario} (${disponibles > 0 ? disponibles : 0} disponibles)`,
        };
      });

      // Filtrar solo horarios disponibles para el desplegable
      const horariosParaSelect = horariosDisponibilidad
        .filter((h) => h.disponible)
        .map((h) => ({
          value: h.horarioCompleto,
          label: h.label,
          horario: h.horario,
          cupoMaximo: h.cupoMaximo,
          disponibles: h.disponibles
        }));

      res.status(200).json({
        message: "Disponibilidad de horarios obtenida exitosamente",
        fecha: fecha,
        diaSemana: diaSemanaAjustado,
        horarios: horariosDisponibilidad,
        horariosDisponibles: horariosParaSelect,
        resumen: {
          totalHorarios: horariosCompletos.length,
          horariosDisponibles: horariosDisponibilidad.filter((h) => h.disponible).length,
          horariosCompletos: horariosDisponibilidad.filter((h) => !h.disponible).length,
        },
      });
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

// Cancelar un turno
export const cancelarTurno = (req, res) => {
  try {
    const { idTurno } = req.params;

    // Validar que el turno existe y no esté ya finalizado o cancelado
    const verificarTurnoQuery = `
      SELECT EstadoTurno 
      FROM turnos 
      WHERE idTurno = ?
    `;
    db.query(verificarTurnoQuery, [idTurno], (err, results) => {
      if (err) {
        console.error("Error al verificar turno:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Turno no encontrado" });
      }
      const estadoActual = results[0].EstadoTurno;
      if (estadoActual === "Finalizado" || estadoActual === "Cancelado") {
        return res
          .status(400)
          .json({
            message: `No se puede cancelar un turno que ya está ${estadoActual}`,
          });
      }
      // Actualizar el estado del turno a 'Cancelado'
      const cancelarTurnoQuery = `
        UPDATE turnos 
        SET EstadoTurno = 'Cancelado' 
        WHERE idTurno = ?
      `;
      db.query(cancelarTurnoQuery, [idTurno], (err, updateResults) => {
        if (err) {
          console.error("Error al cancelar turno:", err);
          return res.status(500).json({ message: "Error al cancelar turno" });
        }
        res.status(200).json({
          message: "Turno cancelado exitosamente",
          idTurno: idTurno,
          estadoAnterior: estadoActual,
          estadoActual: "Cancelado",
        });
      });
    });
  } catch (error) {
    console.error("Error en cancelarTurno:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// FUNCIÓN: Obtener detalles completos de un turno específico
export const obtenerDetallesTurno = (req, res) => {
  const { idTurno } = req.params;

  const detallesTurnoQuery = `
    SELECT 
      t.idTurno,
      t.EstadoTurno,
      p.NombrePaciente,
      p.ApellidoPaciente,
      p.DNI,
      ep.ArchivoURL as OrdenMedicaURL,
      ep.FechaEstudio as FechaOrdenMedica,
      ep.Descripcion as DescripcionOrdenMedica
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    LEFT JOIN estudios_paciente ep ON p.idPaciente = ep.idPaciente 
      AND ep.Descripcion LIKE CONCAT('%Solicitud de turno #', t.idTurno, '%')
    WHERE t.idTurno = ?
    LIMIT 1
  `;

  db.query(detallesTurnoQuery, [idTurno], (err, results) => {
    if (err) {
      console.error("Error al obtener detalles del turno:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Turno no encontrado"
      });
    }

    const turno = results[0];

    res.status(200).json({
      message: "Detalles del turno obtenidos exitosamente",
      turno: {
        idTurno: turno.idTurno,
        estado: turno.EstadoTurno,
        nombre: turno.NombrePaciente,
        apellido: turno.ApellidoPaciente,
        dni: turno.DNI,
        ordenMedica: turno.OrdenMedicaURL ? {
          url: turno.OrdenMedicaURL,
          fechaSubida: turno.FechaOrdenMedica,
          descripcion: turno.DescripcionOrdenMedica
        } : null
      }
    });
  });
};
