import e from "express";
import db from "../../Config/db.js";
import bcrypt from "bcryptjs";
import { enviarEmailBienvenida } from "../../Config/mailer.js"; 

export const traerPacientes = (req, res) => {
  const traerPacientesQuery = `
    SELECT p.idPaciente, p.DNI, p.NombrePaciente, p.ApellidoPaciente, p.FechaNacPaciente,
           p.TelefonoPaciente, p.DireccionPaciente, p.Sexo, p.idLocalidad, p.IsActive,
           l.NombreLocalidad, 
           u.idUsuario, u.MailUsuario
    FROM pacientes p
    INNER JOIN localidades l ON p.idLocalidad = l.idLocalidad
    LEFT JOIN usuarios u ON p.idUsuario = u.idUsuario
  `;
  db.query(traerPacientesQuery, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error en el servidor" });
    }
    // Agregar información adicional para cada paciente
    const pacientesConInfo = results.map(paciente => ({
      ...paciente,
      PasswordTemporal: true // Por seguridad, no devolvemos la contraseña real
    }));
    return res.status(200).json(pacientesConInfo);
  });
};
export const actualizarPaciente = (req, res) => {
  try {
    const { idPaciente } = req.params;
    const {
      NombrePaciente,
      ApellidoPaciente,
      DNI,
      FechaNacPaciente,
      TelefonoPaciente,
      DireccionPaciente,
      Sexo,
      idLocalidad,
    } = req.body;

    if (!NombrePaciente || !ApellidoPaciente || !DNI || !FechaNacPaciente ||
        !TelefonoPaciente || !DireccionPaciente || !Sexo || !idLocalidad) {
      return res.status(400).json({ message: "Faltan datos obligatorios del paciente" });
    }

    let sexoNormalizado = Sexo;
    if (Sexo === 'M' || Sexo === 'Masculino') {
        sexoNormalizado = 'Masculino';
    } else if (Sexo === 'F' || Sexo === 'Femenino') {
        sexoNormalizado = 'Femenino';
    } else if (Sexo === 'O' || Sexo === 'Otro') {
        sexoNormalizado = 'Otro';
    } else {
        return res.status(400).json({ 
            message: "Valor de Sexo inválido. Debe ser 'Masculino', 'Femenino' o 'Otro'" 
        });
    }

    const verificarDNIQuery = "SELECT idPaciente FROM pacientes WHERE DNI = ? AND idPaciente != ?";
    db.query(verificarDNIQuery, [DNI, idPaciente], (error, pacienteExistente) => {
      if (error) {
        return res.status(500).json({ message: 'Error al verificar DNI' });
      }

      if (pacienteExistente.length > 0) {
        return res.status(400).json({ message: "El DNI ya está registrado por otro paciente" });
      }

      const actualizarPacienteQuery = `
        UPDATE pacientes 
        SET NombrePaciente = ?, ApellidoPaciente = ?, DNI = ?, FechaNacPaciente = ?, 
            TelefonoPaciente = ?, DireccionPaciente = ?, Sexo = ?, idLocalidad = ? 
        WHERE idPaciente = ?
      `;

      db.query(
        actualizarPacienteQuery,
        [
          NombrePaciente,
          ApellidoPaciente,
          DNI,
          FechaNacPaciente,
          TelefonoPaciente,
          DireccionPaciente,
          sexoNormalizado,
          idLocalidad,
          idPaciente,
        ],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: "Error al actualizar paciente" });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Paciente no encontrado" });
          }

          res.status(200).json({ message: "Paciente actualizado exitosamente" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};
export const cambiarEstadoPaciente = (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { IsActive } = req.body;

    if (IsActive !== 0 && IsActive !== 1) {
      return res.status(400).json({
        message: "IsActive debe ser 0 (inactivo) o 1 (activo)",
      });
    }

    const verificarEstadoQuery = `
      SELECT IsActive 
      FROM pacientes 
      WHERE idPaciente = ?
    `;

    db.query(verificarEstadoQuery, [idPaciente], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error al verificar estado del paciente" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const estadoActual = results[0].IsActive;

      if (estadoActual === IsActive) {
        const estadoTexto = IsActive === 1 ? "activo" : "inactivo";
        return res.status(400).json({
          message: `El paciente ya se encuentra ${estadoTexto}`,
        });
      }

      const cambiarEstadoQuery = `
        UPDATE pacientes 
        SET IsActive = ?
        WHERE idPaciente = ?
      `;

      db.query(
        cambiarEstadoQuery,
        [IsActive, idPaciente],
        (error, updateResults) => {
          if (error) {
            return res.status(500).json({ message: "Error al cambiar estado del paciente" });
          }

          const mensaje =
            IsActive === 1
              ? "Paciente activado exitosamente"
              : "Paciente desactivado exitosamente";
          res.status(200).json({ message: mensaje });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};
export const crearPaciente = (req, res) => {
    try {
        const {
            DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente,
            TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad,
            MailUsuario, PasswordUsuario
        } = req.body;

        if (!DNI || !NombrePaciente || !ApellidoPaciente || !FechaNacPaciente ||
            !TelefonoPaciente || !DireccionPaciente || !Sexo || !idLocalidad) {
            return res.status(400).json({ message: "Faltan datos obligatorios del paciente" });
        }

        let sexoNormalizado = Sexo;
        if (Sexo === 'M' || Sexo === 'Masculino') {
            sexoNormalizado = 'Masculino';
        } else if (Sexo === 'F' || Sexo === 'Femenino') {
            sexoNormalizado = 'Femenino';
        } else if (Sexo === 'O' || Sexo === 'Otro') {
            sexoNormalizado = 'Otro';
        } else {
            return res.status(400).json({ 
                message: "Valor de Sexo inválido. Debe ser 'Masculino', 'Femenino' o 'Otro'" 
            });
        }

        let emailFinal = MailUsuario;
        if (!emailFinal || emailFinal.trim() === "") {
            emailFinal = `${DNI}@sinmail.local`;
        }

        const passwordFinal = PasswordUsuario && PasswordUsuario.trim() !== "" 
            ? PasswordUsuario 
            : "1234";

        const verificarEmailQuery = "SELECT idUsuario FROM usuarios WHERE MailUsuario = ?";
        
        db.query(verificarEmailQuery, [emailFinal], (error, usuarioExistente) => {
            if (error) {
                return res.status(500).json({ message: 'Error al verificar email' });
            }

            if (usuarioExistente.length > 0) {
                return res.status(400).json({ message: "El email ya está registrado" });
            }

            const verificarDNIQuery = "SELECT idPaciente FROM pacientes WHERE DNI = ?";
            
            db.query(verificarDNIQuery, [DNI], async (error, pacienteExistente) => {
                if (error) {
                    return res.status(500).json({ message: 'Error al verificar DNI' });
                }

                if (pacienteExistente.length > 0) {
                    return res.status(400).json({ message: "El DNI ya está registrado" });
                }

                try {
                    const hashedPassword = await bcrypt.hash(passwordFinal, 10);
                    const idRolPaciente = 3; 
                    const crearUsuarioQuery = `
                        INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol) 
                        VALUES (?, ?, ?)
                    `;
                    
                    db.query(crearUsuarioQuery, [emailFinal, hashedPassword, idRolPaciente], (error, resultUsuario) => {
                        if (error) {
                            return res.status(500).json({ message: 'Error al crear usuario' });
                        }

                        const idUsuarioNuevo = resultUsuario.insertId;

                        const crearPacienteQuery = `
                            INSERT INTO pacientes 
                            (DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente, 
                             TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad, idUsuario)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        const paramsPaciente = [
                            DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente,
                            TelefonoPaciente, DireccionPaciente, sexoNormalizado, idLocalidad, idUsuarioNuevo
                        ];

                        db.query(crearPacienteQuery, paramsPaciente, async (error, resultPaciente) => {
                            if (error) {
                                db.query("DELETE FROM usuarios WHERE idUsuario = ?", [idUsuarioNuevo], () => {});
                                return res.status(500).json({ message: 'Error al crear paciente' });
                            }

                            // Enviar correo de bienvenida
                            const datosEmail = {
                                nombreCompleto: `${NombrePaciente} ${ApellidoPaciente}`,
                                tipoUsuario: 'Paciente',
                                passwordTemporal: passwordFinal === "1234" ? "1234" : null
                            };
                            
                            enviarEmailBienvenida(emailFinal, datosEmail).catch(err => {
                                console.error('Error al enviar correo de bienvenida:', err);
                            });

                            res.status(201).json({
                                message: "Paciente creado correctamente",
                                idPaciente: resultPaciente.insertId,
                                usuario: {
                                    idUsuario: idUsuarioNuevo,
                                    MailUsuario: emailFinal,
                                    PasswordTemporal: passwordFinal === "1234"
                                }
                            });
                        });
                    });
                } catch (hashError) {
                    res.status(500).json({ message: 'Error al procesar contraseña' });
                }
            });
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
};
export const traerLocalidades = (req, res) => {
  const query = "SELECT idLocalidad, NombreLocalidad FROM localidades WHERE IsActive = 1";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error en el servidor" });
    }
    return res.status(200).json(results);
  });
};
 // traer paciente por id
export const obtenerPacientePorId = (req, res) => {
   try {
    const { idPaciente } = req.params;
    const obtenerPacientePorId = "SELECT p.DNI, p.NombrePaciente, p.ApellidoPaciente, p.FechaNacPaciente, p.TelefonoPaciente, p.DireccionPaciente, p.Sexo, p.idLocalidad, p.IsActive, l.NombreLocalidad, u.idUsuario, u.MailUsuario FROM pacientes p INNER JOIN localidades l ON p.idLocalidad = l.idLocalidad LEFT JOIN usuarios u ON p.idUsuario = u.idUsuario WHERE p.idPaciente = ?";
    db.query(obtenerPacientePorId, [idPaciente], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
//Obtener turnos de paciente por id de paciente
export const obtenerTurnosPorIdPaciente = (req, res) => {
  try {
    const { idPaciente } = req.params;
    if (!idPaciente) {
      return res.status(400).json({ message: "Falta idPaciente" });
    }
    const obtenerTurnosPaciente = "SELECT t.idTurno, t.FechaSolicitudTurno, t.HorarioRequeridoTurno, t.EstadoTurno, tr.NombreTratamiento, CONCAT (e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS NombreEmpleado FROM turnos t LEFT JOIN tratamientos tr ON t.idTratamiento = tr.idTratamiento LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado WHERE t.idPaciente = ?";
    db.query(obtenerTurnosPaciente, [idPaciente], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error en el servidor" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
//obtener detalles del turno de un paciente 
export const obtenerDetallesTurno = (req, res) => {
 try {
  const {idPaciente} = req.params;
  if (!idPaciente) {
    return res.status(400).json({ message: "Falta idPaciente" });
  }
  const obtenerDetallesTurnoQuery = "SELECT t.idTurno, t.EstadoTurno, t.FechaRequeridaTurno, t.HorarioRequeridoTurno FROM turnos t WHERE t.idPaciente = ?";
  db.query(obtenerDetallesTurnoQuery, [idPaciente], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.status(200).json(results);
  });
} catch (error) {
  res.status(500).json({ message: "Error en el servidor" });
}
};
//obtener el mail de un paciente por idPaciente
export const obtenerMailPacientePorId = (req, res) => {
  try {
    const { idPaciente } = req.params;
    const obtenerMailQuery = "SELECT u.MailUsuario FROM pacientes p JOIN usuarios u ON p.idUsuario = u.idUsuario WHERE p.idPaciente = ?";
    db.query(obtenerMailQuery, [idPaciente], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error en el servidor" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
//funcion para el paciente cancele alguno de sus turnos 
export const cancelarTurnoPaciente = (req, res) => {
  try {
    const { idPaciente, idTurno } = req.params;

    if (!idPaciente || !idTurno) {
      return res.status(400).json({ message: "ID del paciente y del turno son requeridos" });
    }

    // Verificar que el turno existe, pertenece al paciente y no esté ya finalizado o cancelado
    const verificarTurnoQuery = `
      SELECT EstadoTurno, idPaciente
      FROM turnos 
      WHERE idTurno = ?
    `;

    db.query(verificarTurnoQuery, [idTurno], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Turno no encontrado" });
      }

      const turno = results[0];

      // Verificar que el turno pertenece al paciente
      if (turno.idPaciente !== parseInt(idPaciente)) {
        return res.status(403).json({ message: "Este turno no pertenece al paciente" });
      }

      const estadoActual = turno.EstadoTurno;

      // Verificar que el turno no esté finalizado o cancelado
      if (estadoActual === "Finalizado" || estadoActual === "Cancelado") {
        return res.status(400).json({
          message: `No se puede cancelar un turno que ya está ${estadoActual}`
        });
      }

      // Actualizar el estado del turno a 'Cancelado'
      const cancelarTurnoQuery = `
        UPDATE turnos 
        SET EstadoTurno = 'Cancelado' 
        WHERE idTurno = ? AND idPaciente = ?
      `;

      db.query(cancelarTurnoQuery, [idTurno, idPaciente], (err, updateResults) => {
        if (err) {
          return res.status(500).json({ message: "Error al cancelar turno" });
        }

        if (updateResults.affectedRows === 0) {
          return res.status(404).json({ message: "No se pudo cancelar el turno" });
        }

        res.status(200).json({
          message: "Turno cancelado exitosamente",
          idTurno: idTurno,
          estadoAnterior: estadoActual,
          estadoActual: "Cancelado"
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
// obtener los comentarios de un paciente por idPaciente
export const obtenerComentariosPaciente = (req, res) => {
  try {
    const { idPaciente } = req.params;

    if (!idPaciente) {
      return res.status(400).json({ message: "ID de paciente requerido" });
    }

    const query = `
      SELECT 
        c.idComentario,
        c.CalificacionComentario,
        c.FechaComentario,
        c.Comentario,
        c.IsActive,
        c.IsPublicado
      FROM comentarios c
      WHERE c.idPaciente = ? AND c.IsActive = 1
      ORDER BY c.FechaComentario DESC
    `;

    db.query(query, [idPaciente], (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al obtener comentarios" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};