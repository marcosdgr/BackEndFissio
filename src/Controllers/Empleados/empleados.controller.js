import db from '../../Config/db.js';
import bcrypt from 'bcryptjs';



// obtener todos los empleados
export const obtenerEmpleados = async (req, res) => {
  try {
    const obtenerEmpleadosQuery = `
      SELECT e.idEmpleado, e.DNI, e.NombreEmpleado, e.ApellidoEmpleado, e.FechaNacEmpleado,
             e.TelefonoEmpleado, e.DireccionEmpleado, e.SalarioEmpleado, e.PermisosEmpleado,
             u.MailUsuario, l.NombreLocalidad, c.NombreCat, e.IsActive,
             e.idCatEmpleado, e.idLocalidad
      FROM empleados e
      LEFT JOIN usuarios u ON e.idUsuario = u.idUsuario
      LEFT JOIN localidades l ON e.idLocalidad = l.idLocalidad
      INNER JOIN catEmpleados c ON e.idCatEmpleado = c.idCatEmpleado
    `;
    db.query(obtenerEmpleadosQuery, (error, results) => {
      if (error) {
        console.error('Error al obtener empleados:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// obtener empleado por ID
export const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const obtenerEmpleado = 'SELECT * FROM empleados WHERE idEmpleado = ?';
    db.query(obtenerEmpleado, [idEmpleado], (error, results) => {
      if (error) {
        console.error('Error al obtener el empleado por ID:', error);
        res.status(500).json({ error: 'Error al obtener el empleado por ID' });
        return;
      }
        if (results.length === 0) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// obtener empleado por DNI
export const buscarEmpleadoPorDNI = async (req, res) => {
  try {
    const { DNI } = req.params;
    const buscarEmpleado = 'SELECT * FROM empleados WHERE DNI = ?';
    db.query(buscarEmpleado, [DNI], (error, results) => {
      if (error) {
        console.error('Error al buscar el empleado por DNI:', error);
        res.status(500).json({ error: 'Error al buscar el empleado por DNI' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// obtener empleados activos
export const obtenerEmpleadosActivos = async (req, res) => {
  try {
    const obtenerEmpleadosActivos = 'SELECT * FROM empleados WHERE IsActive = 1';
    db.query(obtenerEmpleadosActivos, (error, results) => {
      if (error) {
        console.error('Error al obtener empleados activos:', error);
        res.status(500).json({ error: 'Error al obtener empleados activos' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

//Obtener empleados inactivos
export const obtenerEmpleadosInactivos = async (req, res) => {
    try {
        const obtenerEmpleadosInactivos = 'SELECT * FROM empleados WHERE IsActive = 0';
        db.query(obtenerEmpleadosInactivos, (error, results) => {
            if (error) {
                console.error('Error al obtener empleados inactivos:', error);
                res.status(500).json({ error: 'Error al obtener empleados inactivos' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//obtener empleados por nombre
export const buscarEmpleadosPorNombre = async (req, res) => {
  try {
    const { NombreEmpleado } = req.params;
    const buscarEmpleados = 'SELECT * FROM empleados WHERE NombreEmpleado LIKE ?';
    db.query(buscarEmpleados, [`%${NombreEmpleado}%`], (error, results) => {
      if (error) {
        console.error('Error al buscar empleados por nombre:', error);
        res.status(500).json({ error: 'Error al buscar empleados por nombre' });
        return;
      }
        res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

//obtener empleados por apellido
export const buscarEmpleadosPorApellido = async (req, res) => {
  try {
    const { ApellidoEmpleado } = req.params;
    const buscarEmpleados = 'SELECT * FROM empleados WHERE ApellidoEmpleado LIKE ?';
    db.query(buscarEmpleados, [`%${ApellidoEmpleado}%`], (error, results) => {
      if (error) {
        console.error('Error al buscar empleados por apellido:', error);
        res.status(500).json({ error: 'Error al buscar empleados por apellido' });
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Crear nuevo empleado
export const crearEmpleado = async (req, res) => {
  // Traigo datos del body
  const {
    MailUsuario,
    PasswordUsuario,
    DNI,
    NombreEmpleado,
    ApellidoEmpleado,
    FechaNacEmpleado,
    TelefonoEmpleado,
    DireccionEmpleado,
    SalarioEmpleado,
    PermisosEmpleado,
    idLocalidad,
    idUsuario,
    idCatEmpleado,
  } = req.body;

  try {
    // 1- validar campos obligatorios para empleado
    if (!DNI || !NombreEmpleado || !ApellidoEmpleado || !FechaNacEmpleado || !SalarioEmpleado || !idCatEmpleado) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados' });
    }

    // Si se envía PermisosEmpleado (enum), validar valores permitidos
    const permisosValidos = ['Administración', 'Kinesiología', 'Otros'];
    if (PermisosEmpleado && !permisosValidos.includes(PermisosEmpleado)) {
      return res.status(400).json({ message: `PermisosEmpleado inválido. Valores permitidos: ${permisosValidos.join(', ')}` });
    }

    // 2- verificar que el DNI no esté registrado en empleados
    const verificarDNI = `SELECT idEmpleado FROM empleados WHERE DNI = ? LIMIT 1`;
    db.query(verificarDNI, [DNI], (err, dniRes) => {
      if (err) {
        console.error('Error en la consulta de verificación de DNI (empleados):', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (dniRes && dniRes.length > 0) {
        return res.status(409).json({ message: 'El DNI ya está registrado' });
      }

      // 3- verificar teléfono en empleados (si se envía)
      if (TelefonoEmpleado) {
        const verificarTelefono = `SELECT idEmpleado FROM empleados WHERE TelefonoEmpleado = ? LIMIT 1`;
        db.query(verificarTelefono, [TelefonoEmpleado], (errTel, telRes) => {
          if (errTel) {
            console.error('Error en la consulta de verificación de teléfono (empleados):', errTel);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          if (telRes && telRes.length > 0) {
            return res.status(409).json({ message: 'El teléfono ya está registrado' });
          }

          // Continuar flujo
          handleUserAndInsert();
        });
      } else {
        handleUserAndInsert();
      }

      // función que maneja creación de usuario (si corresponde) y la inserción del empleado
      function handleUserAndInsert() {
        // si proporcionaron idUsuario -> verificar existencia y usarlo
        if (idUsuario) {
          const verificarUsuario = `SELECT idUsuario FROM usuarios WHERE idUsuario = ? LIMIT 1`;
          db.query(verificarUsuario, [idUsuario], (errUser, userRes) => {
            if (errUser) {
              console.error('Error al verificar idUsuario:', errUser);
              return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (!userRes || userRes.length === 0) {
              return res.status(404).json({ message: 'Usuario proporcionado no existe' });
            }

            // insertar empleado con idUsuario existente
            insertEmpleado(userRes[0].idUsuario);
          });
          return;
        }

        // si proporcionaron MailUsuario y PasswordUsuario -> crear usuario
        if (MailUsuario && PasswordUsuario) {
          // 4- verificar que el mail no esté registrado en usuarios
          const verificarMail = `SELECT idUsuario FROM usuarios WHERE MailUsuario = ? LIMIT 1`;
          db.query(verificarMail, [MailUsuario], (errMail, mailRes) => {
            if (errMail) {
              console.error('Error en la consulta de verificación de mail (usuarios):', errMail);
              return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (mailRes && mailRes.length > 0) {
              return res.status(409).json({ message: 'El mail ya está registrado' });
            }

            // 5- obtener idRol para 'Empleado'
            const obtenerRolEmpleado = `SELECT idRol FROM roles WHERE NombreRol = 'Empleado' LIMIT 1`;
            db.query(obtenerRolEmpleado, (errRol, rolRes) => {
              if (errRol) {
                console.error('Error al obtener rol Empleado:', errRol);
                return res.status(500).json({ message: 'Error en el servidor' });
              }

              if (!rolRes || rolRes.length === 0) {
                return res.status(500).json({ message: "Rol 'Empleado' no encontrado en la base de datos" });
              }

              const idRolEmpleado = rolRes[0].idRol;

              // 6- encriptar contraseña y crear usuario
              const saltRounds = 10;
              bcrypt.hash(PasswordUsuario, saltRounds, (errHash, hashedPassword) => {
                if (errHash) {
                  console.error('Error al encriptar la contraseña:', errHash);
                  return res.status(500).json({ message: 'Error en el servidor' });
                }

                const insertarUsuario = `INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol, IsActive) VALUES (?, ?, ?, 1)`;
                db.query(insertarUsuario, [MailUsuario, hashedPassword, idRolEmpleado], (errInsertUser, userResults) => {
                  if (errInsertUser) {
                    console.error('Error en la inserción del usuario:', errInsertUser);
                    return res.status(500).json({ message: 'Error en el servidor' });
                  }

                  const idUsuarioCreado = userResults.insertId;
                  // insertar empleado con idUsuarioCreado
                  insertEmpleado(idUsuarioCreado, true);
                });
              });
            });
          });
          return;
        }

        // si no se proporcionó idUsuario ni Mail/Password -> error
        return res.status(400).json({ message: 'Debe proporcionar idUsuario existente o MailUsuario y PasswordUsuario para crear un usuario asociado' });
      }

      // Inserta empleado en la tabla empleados. Si createdUserFlag es true, hace rollback del usuario en caso de fallo.
      function insertEmpleado(finalIdUsuario, createdUserFlag = false) {
        const nuevoEmpleado = `INSERT INTO empleados (DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, PermisosEmpleado, idLocalidad, idUsuario, idCatEmpleado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(nuevoEmpleado, [DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado || null, DireccionEmpleado || null, SalarioEmpleado, PermisosEmpleado || null, idLocalidad || null, finalIdUsuario, idCatEmpleado], (errInsert, insertResults) => {
          if (errInsert) {
            console.error('Error al crear el empleado:', errInsert);
            // rollback si creamos el usuario en este flujo
            if (createdUserFlag && finalIdUsuario) {
              const eliminarUsuario = `DELETE FROM usuarios WHERE idUsuario = ?`;
              db.query(eliminarUsuario, [finalIdUsuario], (delErr) => {
                if (delErr) console.error('Error al eliminar usuario en rollback:', delErr);
              });
            }

            if (errInsert.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ message: 'Una o más referencias (categoría, localidad, usuario) no existen' });
            }

            return res.status(500).json({ message: 'Error al crear el empleado' });
          }

          return res.status(201).json({ message: 'Empleado creado exitosamente', idEmpleado: insertResults.insertId, idUsuario: finalIdUsuario });
        });
      }
    });
  } catch (error) {
    console.error('Error al crear el empleado:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};
// Actualizar empleado 
export const actualizarEmpleado = (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const {
      DNI,
      NombreEmpleado,
      ApellidoEmpleado,
      FechaNacEmpleado,
      TelefonoEmpleado,
      DireccionEmpleado,
      SalarioEmpleado,
      PermisosEmpleado,
      idLocalidad,
      idUsuario,
      idCatEmpleado,
      MailUsuario
    } = req.body;

    const id = Number(idEmpleado);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'idEmpleado inválido' });
    }

    // Primero obtener el empleado actual para saber idUsuario si no se envía
    const obtenerEmpleadoQuery = 'SELECT idUsuario FROM empleados WHERE idEmpleado = ? LIMIT 1';
    db.query(obtenerEmpleadoQuery, [id], (err, empResults) => {
      if (err) {
        console.error('Error al obtener empleado:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (!empResults || empResults.length === 0) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
      }

      const currentUserId = empResults[0].idUsuario;
      const finalUserId = idUsuario || currentUserId;

      // Si llega MailUsuario, actualizar la tabla usuarios antes de actualizar empleados
      const updateEmployeeAfterUser = () => {
        // Validar PermisosEmpleado si se proporciona
        const permisosValidos = ['Administración', 'Kinesiología', 'Otros'];
        if (PermisosEmpleado && !permisosValidos.includes(PermisosEmpleado)) {
          return res.status(400).json({ message: `PermisosEmpleado inválido. Valores permitidos: ${permisosValidos.join(', ')}` });
        }

        const actualizarEmpleadoQuery = `
          UPDATE empleados 
          SET DNI = ?, NombreEmpleado = ?, ApellidoEmpleado = ?, FechaNacEmpleado = ?, 
              TelefonoEmpleado = ?, DireccionEmpleado = ?, SalarioEmpleado = ?, PermisosEmpleado = ?,
              idLocalidad = ?, idUsuario = ?, idCatEmpleado = ? 
          WHERE idEmpleado = ?
        `;

            const params = [DNI, NombreEmpleado, ApellidoEmpleado, FechaNacEmpleado, TelefonoEmpleado, DireccionEmpleado, SalarioEmpleado, PermisosEmpleado || null, idLocalidad, finalUserId, idCatEmpleado, id];

        db.query(actualizarEmpleadoQuery, params, (error, results) => {
          if (error) {
            console.error('Error al actualizar el empleado:', error);

            if (error.code === 'ER_DUP_ENTRY') {
              if (error.message.includes('DNI') || error.sqlMessage?.includes('DNI')) {
                return res.status(400).json({ message: 'El DNI ya está registrado por otro empleado' });
              }
              if (error.message.includes('TelefonoEmpleado') || error.sqlMessage?.includes('TelefonoEmpleado') || error.message.includes('telefono') || error.sqlMessage?.includes('telefono')) {
                return res.status(400).json({ message: 'El teléfono ya está registrado por otro empleado' });
              }
              return res.status(400).json({ message: 'Los datos ya están registrados por otro empleado' });
            }

            return res.status(500).json({ message: 'Error al actualizar empleado' });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
          }

          return res.status(200).json({ message: 'Empleado actualizado exitosamente' });
        });
      };

      if (MailUsuario) {
        // verificar que el mail no esté en uso por otro usuario
        const verificarMail = 'SELECT idUsuario FROM usuarios WHERE MailUsuario = ? AND idUsuario <> ? LIMIT 1';
        db.query(verificarMail, [MailUsuario, finalUserId], (errMail, mailRes) => {
          if (errMail) {
            console.error('Error al verificar mail:', errMail);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          if (mailRes && mailRes.length > 0) {
            return res.status(409).json({ message: 'El mail ya está registrado por otro usuario' });
          }

          // verificar que el usuario existe
          const verificarUsuario = 'SELECT idUsuario FROM usuarios WHERE idUsuario = ? LIMIT 1';
          db.query(verificarUsuario, [finalUserId], (errUser, userRes) => {
            if (errUser) {
              console.error('Error al verificar usuario:', errUser);
              return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (!userRes || userRes.length === 0) {
              return res.status(404).json({ message: 'Usuario asociado no encontrado' });
            }

            // actualizar el mail
            const actualizarMailQuery = 'UPDATE usuarios SET MailUsuario = ? WHERE idUsuario = ?';
            db.query(actualizarMailQuery, [MailUsuario, finalUserId], (errUpd, updRes) => {
              if (errUpd) {
                console.error('Error al actualizar mail de usuario:', errUpd);
                return res.status(500).json({ message: 'Error al actualizar mail de usuario' });
              }

              // continuar con la actualización del empleado
              updateEmployeeAfterUser();
            });
          });
        });
      } else {
        // no se cambia el mail, solo actualizamos empleado
        updateEmployeeAfterUser();
      }
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};
// Cambiar estado del empleado (activar/desactivar)
export const cambiarEstadoEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;
    const { IsActive } = req.body;

    // Validar que IsActive sea un valor válido
    if (IsActive !== 0 && IsActive !== 1) {
      return res.status(400).json({ 
        message: 'IsActive debe ser 0 (inactivo) o 1 (activo)' 
      });
    }

    // Primero verificar el estado actual del empleado
    const verificarEstadoQuery = `
      SELECT IsActive 
      FROM empleados 
      WHERE idEmpleado = ?
    `;

    db.query(verificarEstadoQuery, [idEmpleado], (err, results) => {
      if (err) {
        console.error('Error al verificar estado del empleado:', err);
        return res.status(500).json({ message: 'Error al verificar estado del empleado' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
      }

      const estadoActual = results[0].IsActive;

      // Validar que el estado nuevo sea diferente al actual
      if (estadoActual === IsActive) {
        const estadoTexto = IsActive === 1 ? 'activo' : 'inactivo';
        return res.status(400).json({ 
          message: `El empleado ya se encuentra ${estadoTexto}` 
        });
      }

      // Si es diferente, proceder con el cambio
      const cambiarEstadoQuery = `
        UPDATE empleados 
        SET IsActive = ?
        WHERE idEmpleado = ?
      `;

      db.query(cambiarEstadoQuery, [IsActive, idEmpleado], (error, updateResults) => {
        if (error) {
          console.error('Error al cambiar estado del empleado:', error);
          return res.status(500).json({ message: 'Error al cambiar estado del empleado' });
        }

        const mensaje = IsActive === 1 ? 'Empleado activado exitosamente' : 'Empleado desactivado exitosamente';
        res.status(200).json({ message: mensaje });
      });
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
