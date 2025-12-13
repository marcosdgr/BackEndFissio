import db from "../../Config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { enviarEmailRecuperacion } from "../../Config/mailer.js";

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
        e.NombreEmpleado,
        e.ApellidoEmpleado,
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
            NombreEmpleado: user.NombreEmpleado || null,
            ApellidoEmpleado: user.ApellidoEmpleado || null,
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


// Controlador para iniciar el proceso de recuperación de contraseña
export const recuperarPassword = async (req, res) => {
  try {
    const { MailUsuario } = req.body;

    if (!MailUsuario) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    const consulta = "SELECT idUsuario, MailUsuario, IsActive FROM usuarios WHERE MailUsuario = ?";

    db.query(consulta, [MailUsuario], async (err, result) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const usuario = result[0];

      if (!usuario.IsActive) {
        return res.status(403).json({ message: "Usuario inactivo" });
      }

      const token = jwt.sign(
        { idUsuario: usuario.idUsuario, email: usuario.MailUsuario },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const link = `http://localhost:5173/auth/cambio_password/${token}`;
      
      // Enviar email de recuperación
      try {
        await enviarEmailRecuperacion(MailUsuario, link);
        console.log(`📧 Email de recuperación enviado a: ${MailUsuario}`);
      } catch (emailError) {
        console.error("Error al enviar email de recuperación:", emailError);
        return res.status(500).json({ 
          message: "Error al enviar el email de recuperación. Por favor, intenta nuevamente." 
        });
      }

      res.status(200).json({ 
        message: "Email de recuperación enviado exitosamente. Revisa tu bandeja de entrada."
      });
    });
  } catch (error) {
    console.error("Error en recuperarPassword:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const cambioPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { contraseña } = req.body;

    if (!contraseña) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }

    // Validar longitud mínima de contraseña
    if (contraseña.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hashear la nueva contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const consulta = "UPDATE usuarios SET PasswordUsuario = ? WHERE idUsuario = ?";

    db.query(consulta, [hashedPassword, decoded.idUsuario], (err, result) => {
      if (err) {
        console.error("Error al actualizar contraseña:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    });
  } catch (error) {
    console.error("Error en cambioPassword:", error);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }
    res.status(500).json({ message: "Error del servidor" });
  }
};