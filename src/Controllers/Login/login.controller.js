import db from "../../Config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = (req, res) => {
  try {
    const { MailUsuario, PasswordUsuario } = req.body;

    // 1- Validar campos requeridos
    if (!MailUsuario || !PasswordUsuario) {
      return res
        .status(400)
        .json({ message: "Mail y contraseña son requeridos" });
    }

    // 2- Traer usuario + rol + empleado + paciente + permisos
    const credenciales = `
      SELECT 
        u.idUsuario,
        u.MailUsuario,
        u.PasswordUsuario,
        u.IsActive,
        r.NombreRol,
        e.idEmpleado,
        e.PermisosEmpleado,
        p.idPaciente,
        p.NombrePaciente,
        p.ApellidoPaciente,
        p.DNI
      FROM usuarios u
      INNER JOIN roles r 
        ON u.idRol = r.idRol
      LEFT JOIN empleados e 
        ON u.idUsuario = e.idUsuario
      LEFT JOIN pacientes p 
        ON u.idUsuario = p.idUsuario
      WHERE u.MailUsuario = ?
      LIMIT 1
    `;

    db.query(credenciales, [MailUsuario], (err, results) => {
      if (err) {
        console.error("Error en la consulta de credenciales:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      // 3- Usuario no encontrado
      if (results.length === 0) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const user = results[0];

      // 4- Usuario inactivo
      if (!user.IsActive) {
        return res.status(403).json({ message: "Usuario inactivo" });
      }

      // 5- Verificar contraseña
      bcrypt.compare(PasswordUsuario, user.PasswordUsuario, (err, isMatch) => {
        if (err) {
          console.error("Error al verificar la contraseña:", err);
          return res.status(500).json({ message: "Error en el servidor" });
        }

        if (!isMatch) {
          return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 6- Armar payload del token
        const payload = {
          idUsuario: user.idUsuario,
          MailUsuario: user.MailUsuario,
          NombreRol: user.NombreRol,              // Administrador | Paciente | Empleado
          idEmpleado: user.idEmpleado || null,
          idPaciente: user.idPaciente || null,
          PermisosEmpleado: user.PermisosEmpleado || null // Kinesiologia | Administracion | null
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });

        // 7- Respuesta al frontend
        return res.status(200).json({
          message: "Login exitoso",
          token,
          usuario: {
            idUsuario: user.idUsuario,
            MailUsuario: user.MailUsuario,
            NombreRol: user.NombreRol,
            idEmpleado: user.idEmpleado || null,
            idPaciente: user.idPaciente || null,
            PermisosEmpleado: user.PermisosEmpleado || null,
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
