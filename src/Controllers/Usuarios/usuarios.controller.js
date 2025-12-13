import db from "../../Config/db.js";
import bcrypt from "bcryptjs";
import { enviarEmailBienvenida } from "../../Config/mailer.js";

export const register = (req, res) => {
  // traigo los datos del body
  const {
    MailUsuario,
    PasswordUsuario,
    DNI,
    NombrePaciente,
    ApellidoPaciente,
    FechaNacPaciente,
    TelefonoPaciente,
    DireccionPaciente,
    Sexo,
    idLocalidad,
  } = req.body;

  // 1- verifico que los datos no estén vacíos
  if (
    !MailUsuario ||
    !PasswordUsuario ||
    !DNI ||
    !NombrePaciente ||
    !ApellidoPaciente ||
    !FechaNacPaciente ||
    !TelefonoPaciente ||
    !DireccionPaciente ||
    !Sexo ||
    !idLocalidad
  ) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }
  // 2- verifico que el mail no esté registrado
  const verificarMail = ` 
    SELECT idUsuario
    FROM usuarios
    WHERE MailUsuario = ?
    LIMIT 1
    `;
  db.query(verificarMail, [MailUsuario], (err, results) => {
    if (err) {
      console.error("Error en la consulta de verificación de mail:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    // 3- si el mail ya está registrado, retorno un error
    if (results.length > 0) {
      return res.status(409).json({ message: "El mail ya está registrado" });
    }

    // 4- verificar que el DNI no esté registrado
    const verificarDNI = `
      SELECT idPaciente
      FROM pacientes
      WHERE DNI = ?
      LIMIT 1
    `;

    db.query(verificarDNI, [DNI], (err, dniResults) => {
      if (err) {
        console.error("Error en la consulta de verificación de DNI:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (dniResults.length > 0) {
        return res.status(409).json({ message: "El DNI ya está registrado" });
      }

      // 5- verificar que el teléfono no esté registrado
      const verificarTelefono = `
        SELECT idPaciente
        FROM pacientes
        WHERE TelefonoPaciente = ?
        LIMIT 1
      `;

      db.query(
        verificarTelefono,
        [TelefonoPaciente],
        (err, telefonoResults) => {
          if (err) {
            console.error(
              "Error en la consulta de verificación de teléfono:",
              err
            );
            return res.status(500).json({ message: "Error en el servidor" });
          }

          if (telefonoResults.length > 0) {
            return res
              .status(409)
              .json({ message: "El teléfono ya está registrado" });
          }

          // 6- Encriptar la contraseña antes de guardarla
          const saltRounds = 10;
          bcrypt.hash(PasswordUsuario, saltRounds, (err, hashedPassword) => {
            if (err) {
              console.error("Error al encriptar la contraseña:", err);
              return res.status(500).json({ message: "Error en el servidor" });
            }

            // 5- Obtener el idRol para "Paciente"
            const obtenerRolPaciente = `
        SELECT idRol 
        FROM roles 
        WHERE NombreRol = 'Paciente' 
        LIMIT 1
      `;

            db.query(obtenerRolPaciente, (err, rolResults) => {
              if (err) {
                console.error("Error al obtener rol de paciente:", err);
                return res
                  .status(500)
                  .json({ message: "Error en el servidor" });
              }

              if (rolResults.length === 0) {
                return res.status(500).json({
                  message: "Rol 'Paciente' no encontrado en la base de datos",
                });
              }

              const idRolPaciente = rolResults[0].idRol;

              // 6- insertar el nuevo usuario con contraseña encriptada y rol de paciente
              const insertarUsuario = `
          INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol, IsActive)
          VALUES (?, ?, ?, 1)
        `;

              db.query(
                insertarUsuario,
                [MailUsuario, hashedPassword, idRolPaciente],
                (err, userResults) => {
                  if (err) {
                    console.error("Error en la inserción del usuario:", err);
                    return res
                      .status(500)
                      .json({ message: "Error en el servidor" });
                  }

                  // 7- obtener el ID del usuario recién creado
                  const idUsuarioCreado = userResults.insertId;

                  // 8- insertar datos del paciente
                  const insertarPaciente = `
              INSERT INTO pacientes (
                DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente,
                TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad,
                IsActive, idUsuario
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `;

                  db.query(
                    insertarPaciente,
                    [
                      DNI,
                      NombrePaciente,
                      ApellidoPaciente,
                      FechaNacPaciente,
                      TelefonoPaciente,
                      DireccionPaciente,
                      Sexo,
                      idLocalidad,
                      idUsuarioCreado,
                    ],
                    (err, pacienteResults) => {
                      if (err) {
                        console.error(
                          "Error en la inserción del paciente:",
                          err
                        );
                        // Si falla la inserción del paciente, eliminar el usuario creado
                        const eliminarUsuario = `DELETE FROM usuarios WHERE idUsuario = ?`;
                        db.query(
                          eliminarUsuario,
                          [idUsuarioCreado],
                          (deleteErr) => {
                            if (deleteErr) {
                              console.error(
                                "Error al eliminar usuario:",
                                deleteErr
                              );
                            }
                          }
                        );
                        return res
                          .status(500)
                          .json({
                            message: "Error en el registro del paciente",
                          });
                      }

                      // 9- Enviar correo de bienvenida
                      const datosEmail = {
                        nombreCompleto: `${NombrePaciente} ${ApellidoPaciente}`,
                        tipoUsuario: 'Paciente',
                        passwordTemporal: null
                      };
                      
                      enviarEmailBienvenida(MailUsuario, datosEmail).catch(err => {
                        console.error('Error al enviar correo de bienvenida:', err);
                      });

                      // 10- si todo está bien, retorno un mensaje de éxito
                      return res.status(201).json({
                        message: "Usuario registrado con éxito",
                        idUsuario: idUsuarioCreado,
                        idPaciente: pacienteResults.insertId,
                      });
                    }
                  );
                }
              );
            });
          });
        }
      );
    });
  });
};

// traer usuarios

export const traerUsuarios = (req, res) => {
  const traerQuery = `
    SELECT 
      r.NombreRol,
      u.idUsuario,
      u.MailUsuario,
      u.IsActive
    FROM usuarios u
    INNER JOIN roles r ON u.idRol = r.idRol
    ORDER BY u.idUsuario DESC
    `;
  db.query(traerQuery, (err, results) => {
    if (err) {
      console.error("Error en la consulta de usuarios:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    return res.status(200).json(results);
  });
};

// actualizar rol de usuario (solo admin)
export const actualizarRolUsuario = (req, res) => {
  const { idUsuario } = req.params;
  const { idRol } = req.body;

  // 1- Validar que se proporcionen los datos necesarios
  if (!idUsuario || !idRol) {
    return res
      .status(400)
      .json({ message: "ID de usuario e ID de rol son requeridos" });
  }

  // 2- Verificar que el rol existe en la tabla roles
  const verificarRol = `
    SELECT idRol, NombreRol
    FROM roles
    WHERE idRol = ?
    LIMIT 1
  `;

  db.query(verificarRol, [idRol], (err, rolResults) => {
    if (err) {
      console.error("Error al verificar rol:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (rolResults.length === 0) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    const rolInfo = rolResults[0];

    // 3- Verificar que el usuario existe y obtener su rol actual
    const verificarUsuario = `
      SELECT u.idUsuario, u.idRol, r.NombreRol
      FROM usuarios u
      INNER JOIN roles r ON u.idRol = r.idRol
      WHERE u.idUsuario = ?
      LIMIT 1
    `;

    db.query(verificarUsuario, [idUsuario], (err, userResults) => {
      if (err) {
        console.error("Error al verificar usuario:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const usuarioActual = userResults[0];

      // 4- Verificar si el rol ya es el mismo
      if (usuarioActual.idRol === parseInt(idRol)) {
        return res.status(400).json({
          message: `El usuario ya tiene el rol de ${usuarioActual.NombreRol}`,
        });
      }

      // 5- Actualizar el rol del usuario
      const actualizarRol = `
        UPDATE usuarios 
        SET idRol = ?
        WHERE idUsuario = ?
      `;

      db.query(actualizarRol, [idRol, idUsuario], (err, updateResults) => {
        if (err) {
          console.error("Error al actualizar rol:", err);
          return res.status(500).json({ message: "Error en el servidor" });
        }

        if (updateResults.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "No se pudo actualizar el usuario" });
        }

        return res.status(200).json({
          message: `Rol actualizado exitosamente a ${rolInfo.NombreRol}`,
          idUsuario: idUsuario,
          rolAnterior: usuarioActual.NombreRol,
          rolNuevo: rolInfo.NombreRol,
        });
      });
    });
  });
};

// cambiar estado del usuario (activar/desactivar)
export const cambiarEstadoUsuario = (req, res) => {
  const { idUsuario } = req.params;
  const { IsActive } = req.body;

  // Validar que IsActive sea un valor válido
  if (IsActive !== 0 && IsActive !== 1) {
    return res.status(400).json({ 
      message: "IsActive debe ser 0 (inactivo) o 1 (activo)" 
    });
  }

  // Primero verificar el estado actual del usuario
  const verificarEstadoQuery = `
    SELECT IsActive 
    FROM usuarios 
    WHERE idUsuario = ?
  `;

  db.query(verificarEstadoQuery, [idUsuario], (err, results) => {
    if (err) {
      console.error("Error al verificar estado del usuario:", err);
      return res.status(500).json({ message: "Error al verificar estado del usuario" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const estadoActual = results[0].IsActive;

    // Validar que el estado nuevo sea diferente al actual
    if (estadoActual === IsActive) {
      const estadoTexto = IsActive === 1 ? "activo" : "inactivo";
      return res.status(400).json({ 
        message: `El usuario ya se encuentra ${estadoTexto}` 
      });
    }

    // Si es diferente, proceder con el cambio
    const cambiarEstadoQuery = `
      UPDATE usuarios
      SET IsActive = ?
      WHERE idUsuario = ?
    `;

    db.query(cambiarEstadoQuery, [IsActive, idUsuario], (err, updateResults) => {
      if (err) {
        console.error("Error al cambiar estado del usuario:", err);
        return res.status(500).json({ message: "Error al cambiar estado del usuario" });
      }

      const mensaje = IsActive === 1 ? "Usuario activado exitosamente" : "Usuario desactivado exitosamente";
      return res.status(200).json({ message: mensaje });
    });
  });
};
