import db from "../Config/db.js";
import bcrypt from "bcryptjs";

export const register = (req, res) => {
  // traigo los datos del body
  const { MailUsuario, PasswordUsuario } = req.body;
  // 1- verifico que los datos no estén vacíos
  if (!MailUsuario || !PasswordUsuario) {
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

    // 4- Encriptar la contraseña antes de guardarla
    const saltRounds = 10;
    bcrypt.hash(PasswordUsuario, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Error al encriptar la contraseña:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      // 5- si el mail no está registrado, inserto el nuevo usuario con contraseña encriptada
      const insertarUsuario = `
          INSERT INTO usuarios (MailUsuario, PasswordUsuario, RolUsuario, IsActive)
          VALUES (?, ?, "Paciente", 1)
          `;
      db.query(
        insertarUsuario,
        [MailUsuario, hashedPassword],
        (err, results) => {
          if (err) {
            console.error("Error en la inserción del usuario:", err);
            return res.status(500).json({ message: "Error en el servidor" });
          }
          // 6- si todo está bien, retorno un mensaje de éxito
          return res
            .status(201)
            .json({ message: "Usuario registrado con éxito" });
        }
      );
    });
  });
};

// traer usuarios

export const traerUsuarios = (req, res) => {
  const traerQuery = `
    SELECT idUsuario, MailUsuario, RolUsuario, IsActive
    FROM usuarios
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
  const { RolUsuario } = req.body;

  // 1- Validar que se proporcionen los datos necesarios
  if (!idUsuario || !RolUsuario) {
    return res
      .status(400)
      .json({ message: "ID de usuario y nuevo rol son requeridos" });
  }

  // 2- Validar que el rol sea válido
  const rolesPermitidos = ["Paciente", "Secretaria", "Kinesiologia"];
  if (!rolesPermitidos.includes(RolUsuario)) {
    return res.status(400).json({
      message:
        "Rol no válido. Roles permitidos: Paciente, Secretaria, Kinesiologia",
    });
  }

  // 3- Verificar que el usuario existe
  const verificarUsuario = `
    SELECT idUsuario, RolUsuario
    FROM usuarios
    WHERE idUsuario = ?
    LIMIT 1
  `;

  db.query(verificarUsuario, [idUsuario], (err, results) => {
    if (err) {
      console.error("Error al verificar usuario:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuarioActual = results[0];

    // 4- Verificar si el rol ya es el mismo
    if (usuarioActual.RolUsuario === RolUsuario) {
      return res
        .status(400)
        .json({ message: `El usuario ya tiene el rol de ${RolUsuario}` });
    }

    // 5- Actualizar el rol del usuario
    const actualizarRol = `
      UPDATE usuarios 
      SET RolUsuario = ?
      WHERE idUsuario = ?
    `;

    db.query(actualizarRol, [RolUsuario, idUsuario], (err, results) => {
      if (err) {
        console.error("Error al actualizar rol:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No se pudo actualizar el usuario" });
      }

      return res.status(200).json({
        message: `Rol actualizado exitosamente a ${RolUsuario}`,
        idUsuario: idUsuario,
        nuevoRol: RolUsuario,
      });
    });
  });
};
