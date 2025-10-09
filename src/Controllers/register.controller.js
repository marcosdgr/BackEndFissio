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
