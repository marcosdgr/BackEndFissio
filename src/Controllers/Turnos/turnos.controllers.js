import db from "../../Config/db.js";
import { uploadToCloudinary } from "../../Middlewares/cloudinary.js";

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

          res.status(201).json({
            message: "Solicitud de turno enviada exitosamente",
            idTurno: turnoId,
            estado: "Solicitado",
            mensaje:
              "Su solicitud será procesada por nuestro personal. Recibirá confirmación pronto.",
            ordenMedicaGuardada: OrdenMedicaURL ? true : false,
          });
        }
      );
    });
  } catch (error) {}
};

// PASO 2: Procesar solicitud de turno (Secretaria)
export const procesarSolicitudTurno = (req, res) => {
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

  // Verificar que el turno existe y está en estado 'Solicitado'
  const verificarTurno = `
    SELECT t.*, p.NombrePaciente, p.ApellidoPaciente
    FROM turnos t
    INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
    WHERE t.idTurno = ? 
      AND t.EstadoTurno = 'Solicitado' 
      AND t.InformeTurno LIKE 'SOLICITUD WEB%'
  `;

  db.query(verificarTurno, [idTurno], (err, turnoResults) => {
    if (err) {
      console.error("Error al verificar turno:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (turnoResults.length === 0) {
      return res.status(404).json({
        message: "Solicitud de turno no encontrada o ya fue procesada",
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
                    message: "Turno procesado y confirmado exitosamente",
                    turno: {
                      idTurno: idTurno,
                      paciente: `${turno.NombrePaciente} ${turno.ApellidoPaciente}`,
                      fecha: turno.FechaRequeridaTurno,
                      horario: `${HorarioInicioTurno} - ${HorarioFinTurno}`,
                      kinesiologo: `${empleadoResults[0].NombreEmpleado} ${empleadoResults[0].ApellidoEmpleado}`,
                      sala: idSala,
                      estado: "Pendiente",
                    },
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

// PASO 3: Listar solicitudes pendientes (Para la secretaria)
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
