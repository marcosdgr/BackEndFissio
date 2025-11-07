import db from "../../Config/db.js";
import bcrypt from "bcryptjs"; 

// traer todos los pacientes

export const traerPacientes = (req, res) => {
  const traerPacientesQuery = `
    SELECT p.idPaciente, p.DNI, p.NombrePaciente, p.ApellidoPaciente, p.FechaNacPaciente,
           p.TelefonoPaciente, p.DireccionPaciente, p.Sexo, l.NombreLocalidad, p.IsActive
    FROM pacientes p
    INNER JOIN localidades l ON p.idLocalidad = l.idLocalidad
  `;
  db.query(traerPacientesQuery, (err, results) => {
    if (err) {
      console.error("Error al traer los pacientes:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    return res.status(200).json(results);
  });
};

// actualizar datos del paciente

export const actualizarPaciente = async (req, res) => {
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
        Sexo,
        idLocalidad,
        idPaciente,
      ],
      (error, results) => {
        if (error) {
          console.error("Error al actualizar paciente:", error);

          // Manejo SIMPLE de errores comunes para actualización
          if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("DNI")) {
              return res.status(400).json({
                message: "El DNI ya está registrado por otro paciente",
              });
            }
            if (error.message.includes("TelefonoPaciente")) {
              return res.status(400).json({
                message: "El teléfono ya está registrado por otro paciente",
              });
            }
            return res.status(400).json({
              message: "Los datos ya están registrados por otro paciente",
            });
          }

          return res
            .status(500)
            .json({ message: "Error al actualizar paciente" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Paciente no encontrado" });
        }

        res.status(200).json({ message: "Paciente actualizado exitosamente" });
      }
    );
  } catch (error) {
    console.error("error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// cambiar estado del paciente (activar/desactivar)
export const cambiarEstadoPaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { IsActive } = req.body;

    // Validar que IsActive sea un valor válido
    if (IsActive !== 0 && IsActive !== 1) {
      return res.status(400).json({
        message: "IsActive debe ser 0 (inactivo) o 1 (activo)",
      });
    }

    // Primero verificar el estado actual del paciente
    const verificarEstadoQuery = `
      SELECT IsActive 
      FROM pacientes 
      WHERE idPaciente = ?
    `;

    db.query(verificarEstadoQuery, [idPaciente], (err, results) => {
      if (err) {
        console.error("Error al verificar estado del paciente:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar estado del paciente" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const estadoActual = results[0].IsActive;

      // Validar que el estado nuevo sea diferente al actual
      if (estadoActual === IsActive) {
        const estadoTexto = IsActive === 1 ? "activo" : "inactivo";
        return res.status(400).json({
          message: `El paciente ya se encuentra ${estadoTexto}`,
        });
      }

      // Si es diferente, proceder con el cambio
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
            console.error("Error al cambiar estado del paciente:", error);
            return res
              .status(500)
              .json({ message: "Error al cambiar estado del paciente" });
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
    console.error("error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
 // crear nuevo paciente 
export const crearPaciente = (req, res) => {
    try {
        const {
            DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente,
            TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad,
            MailUsuario, PasswordUsuario
        } = req.body;

        // Validaciones básicas del paciente
        if (!DNI || !NombrePaciente || !ApellidoPaciente || !FechaNacPaciente ||
            !TelefonoPaciente || !DireccionPaciente || !Sexo || !idLocalidad) {
            return res.status(400).json({ message: "Faltan datos obligatorios del paciente" });
        }

        // Si el paciente no tiene email, generamos uno temporal
        let emailFinal = MailUsuario;
        if (!emailFinal || emailFinal.trim() === "") {
            emailFinal = `${DNI}@sinmail.local`;
        }

        // Si no se especificó contraseña, se asigna una genérica temporal
        const passwordFinal = PasswordUsuario && PasswordUsuario.trim() !== "" 
            ? PasswordUsuario 
            : "1234";

        // Verificar si el email ya está en uso
        const verificarEmailQuery = "SELECT idUsuario FROM usuarios WHERE MailUsuario = ?";
        db.query(verificarEmailQuery, [emailFinal], (error, usuarioExistente) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({ message: 'Error al verificar email' });
            }

            if (usuarioExistente.length > 0) {
                return res.status(400).json({ message: "El email ya está registrado" });
            }

            // Verificar si el DNI ya existe
            const verificarDNIQuery = "SELECT idPaciente FROM pacientes WHERE DNI = ?";
            db.query(verificarDNIQuery, [DNI], (error, pacienteExistente) => {
                if (error) {
                    console.error('Error al verificar DNI:', error);
                    return res.status(500).json({ message: 'Error al verificar DNI' });
                }

                if (pacienteExistente.length > 0) {
                    return res.status(400).json({ message: "El DNI ya está registrado" });
                }

                // Verificar si el teléfono ya existe
                const verificarTelefonoQuery = "SELECT idPaciente FROM pacientes WHERE TelefonoPaciente = ?";
                db.query(verificarTelefonoQuery, [TelefonoPaciente], async (error, telefonoExistente) => {
                    if (error) {
                        console.error('Error al verificar teléfono:', error);
                        return res.status(500).json({ message: 'Error al verificar teléfono' });
                    }

                    if (telefonoExistente.length > 0) {
                        return res.status(400).json({ message: "El teléfono ya está registrado" });
                    }

                    try {
                        // Hashear la contraseña
                        const hashedPassword = await bcrypt.hash(passwordFinal, 10);

                        // Crear el usuario (rol paciente = 3)
                        const idRolPaciente = 3; 
                        const crearUsuarioQuery = `
                            INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol) 
                            VALUES (?, ?, ?)
                        `;
                        
                        db.query(crearUsuarioQuery, [emailFinal, hashedPassword, idRolPaciente], (error, resultUsuario) => {
                            if (error) {
                                console.error('Error al crear usuario:', error);
                                return res.status(500).json({ message: 'Error al crear usuario' });
                            }

                            const idUsuarioNuevo = resultUsuario.insertId;

                            // Crear el paciente
                            const crearPacienteQuery = `
                                INSERT INTO pacientes 
                                (DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente, 
                                 TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad, idUsuario)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `;

                            db.query(crearPacienteQuery, [
                                DNI, NombrePaciente, ApellidoPaciente, FechaNacPaciente,
                                TelefonoPaciente, DireccionPaciente, Sexo, idLocalidad, idUsuarioNuevo
                            ], (error, resultPaciente) => {
                                if (error) {
                                    console.error('Error al crear paciente:', error);
                                    
                                    // Si falla crear paciente, eliminar usuario creado (rollback manual)
                                    db.query("DELETE FROM usuarios WHERE idUsuario = ?", [idUsuarioNuevo], (deleteError) => {
                                        if (deleteError) {
                                            console.error('Error al eliminar usuario en rollback:', deleteError);
                                        }
                                    });
                                    
                                    return res.status(500).json({ message: 'Error al crear paciente' });
                                }

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
                        console.error('Error al hashear contraseña:', hashError);
                        res.status(500).json({ message: 'Error al procesar contraseña' });
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};