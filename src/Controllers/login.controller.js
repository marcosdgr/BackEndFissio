import db from "../Config/db.js";
import bcrypt from "bcryptjs";

export const login = (req, res) => {
  // traigo los datos del body
  const { MailUsuario, PasswordUsuario } = req.body;
  // 1- verifico que los datos no estén vacíos
  if (!MailUsuario || !PasswordUsuario) {
    return res
      .status(400)
      .json({ message: "Mail y contraseña con requeridos" });
  }
  // 2- verifico que el usuario exista en la base de datos
  const credenciales = `
    SELECT idUsuario, RolUsuario, PasswordUsuario, IsActive
    FROM usuarios
    WHERE MailUsuario = ?
    LIMIT 1
  `;
  db.query(credenciales, [MailUsuario], (err, results) => {
    if (err) {
      console.error("Error en la consulta de credenciales:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    // 3- si no existe el usuario, retorno un error
    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = results[0];

    // 4- si el usuario no está activo, retorno un error
    if (!user.IsActive) {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    // 5- verifico que la contraseña encriptada sea correcta
    bcrypt.compare(PasswordUsuario, user.PasswordUsuario, (err, isMatch) => {
      if (err) {
        console.error("Error al verificar la contraseña:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      // 6- si la contraseña no coincide, retorno un error
      if (!isMatch) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // 7- si todo está bien, retorno el id y rol del usuario
      return res
        .status(200)
        .json({ 
          message: "Login exitoso",
          idUsuario: user.idUsuario, 
          RolUsuario: user.RolUsuario 
        });
    });

  });
};
