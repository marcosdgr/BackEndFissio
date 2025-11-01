import db from '../Config/db.js';
import { generarToken } from '../Middlewares/mensajeriaInterna/autenticar.js';

// Login de usuario - genera token JWT
export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario con su rol y empleado asociado (si existe)
    const query = `
      SELECT 
        u.idUsuario,
        u.MailUsuario,
        u.PasswordUsuario,
        u.IsActive,
        r.NombreRol,
        e.idEmpleado,
        e.NombreEmpleado,
        e.ApellidoEmpleado
      FROM usuarios u
      INNER JOIN roles r ON u.idRol = r.idRol
      LEFT JOIN empleados e ON u.idUsuario = e.idUsuario
      WHERE u.MailUsuario = ?
    `;
    
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Error al buscar usuario:', error);
        return res.status(500).json({ 
          message: 'Error al buscar usuario' 
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }

      const usuario = results[0];

      // IMPORTANTE: En producción, debes usar bcrypt.compare()
      // Aquí es un ejemplo básico
      if (usuario.PasswordUsuario !== password) {
        return res.status(401).json({ 
          message: 'Credenciales inválidas' 
        });
      }

      // Verificar si el usuario está activo
      if (usuario.IsActive === 0) {
        return res.status(403).json({ 
          message: 'Usuario inactivo. Contacta al administrador' 
        });
      }

      // Generar token JWT
      const token = generarToken({
        idUsuario: usuario.idUsuario,
        email: usuario.MailUsuario,
        rol: usuario.NombreRol,
        idEmpleado: usuario.idEmpleado || null
      });

      // Devolver token y datos del usuario
      res.status(200).json({
        message: 'Login exitoso',
        token,
        usuario: {
          idUsuario: usuario.idUsuario,
          email: usuario.MailUsuario,
          rol: usuario.NombreRol,
          idEmpleado: usuario.idEmpleado,
          nombre: usuario.NombreEmpleado 
            ? `${usuario.NombreEmpleado} ${usuario.ApellidoEmpleado}` 
            : null
        }
      });
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error del servidor',
      error: error.message 
    });
  }
};

// Verificar si el token es válido (opcional, útil para el frontend)
export const verificarToken = (req, res) => {
  // Si llegó aquí, el middleware ya verificó el token
  res.status(200).json({
    message: 'Token válido',
    usuario: req.usuarioAutenticado
  });
};

// Logout (opcional - en JWT no es necesario, pero puedes implementar blacklist)
export const logout = (req, res) => {
  // En JWT, el logout se maneja en el cliente eliminando el token
  // Aquí solo confirmamos
  res.status(200).json({
    message: 'Logout exitoso. Elimina el token del cliente'
  });
};
