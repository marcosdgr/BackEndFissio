import db from "../../Config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = (req, res) => {
  try {
    // traigo los datos del body
    const { MailUsuario, PasswordUsuario } = req.body;
    // 1- verifico que los datos no estén vacíos
    if (!MailUsuario || !PasswordUsuario) {
      return res
        .status(400)
        .json({ message: "Mail y contraseña con requeridos" });
    }
    // 2- verifico que el usuario exista en la base de datos y obtengo su información completa
    const credenciales = `
    SELECT u.idUsuario, u.PasswordUsuario, u.IsActive, r.NombreRol,
           e.idEmpleado, 
           p.idPaciente, p.NombrePaciente, p.ApellidoPaciente, p.DNI
    FROM usuarios u
    INNER JOIN roles r ON u.idRol = r.idRol
    LEFT JOIN empleados e ON u.idUsuario = e.idUsuario
    LEFT JOIN pacientes p ON u.idUsuario = p.idUsuario
    WHERE u.MailUsuario = ?
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

        // 7- si todo está bien, genero el token JWT
        const payload = {
          idUsuario: user.idUsuario,
          MailUsuario: MailUsuario,
          NombreRol: user.NombreRol,
          idEmpleado: user.idEmpleado || null,
          idPaciente: user.idPaciente || null,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "24h", 
        });

        // 8- retorno el token y la información completa del usuario
        return res.status(200).json({
          message: "Login exitoso",
          token: token,
          usuario: {
            idUsuario: user.idUsuario,
            MailUsuario: MailUsuario,
            NombreRol: user.NombreRol,
            idEmpleado: user.idEmpleado || null,
            idPaciente: user.idPaciente || null,
            NombrePaciente: user.NombrePaciente || null,
            ApellidoPaciente: user.ApellidoPaciente || null,
            DNI: user.DNI || null,
          },
        });
      });
    });
  } catch (error) {
    console.error("Error del servidor en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
