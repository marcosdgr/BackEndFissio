import jwt from "jsonwebtoken";


export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h"
  });
};


export const autenticar = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "Acceso denegado. No se proporcionó token." 
      });
    }

    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Si el token ya tiene idEmpleado, lo usamos directamente
    if (decoded.idEmpleado) {
      req.usuarioAutenticado = {
        idUsuario: decoded.idUsuario,
        MailUsuario: decoded.MailUsuario,
        NombreRol: decoded.NombreRol,
        idEmpleado: decoded.idEmpleado
      };
      return next();
    }

    // Si no tiene idEmpleado, lo obtenemos de la BD
    import('../../Config/db.js').then(({ default: db }) => {
      const query = 'SELECT idEmpleado FROM empleados WHERE idUsuario = ? LIMIT 1';
      db.query(query, [decoded.idUsuario], (err, results) => {
        if (err) {
          console.error("Error al obtener idEmpleado:", err);
          return res.status(500).json({ 
            message: "Error al verificar autenticación" 
          });
        }

        req.usuarioAutenticado = {
          idUsuario: decoded.idUsuario,
          MailUsuario: decoded.MailUsuario,
          NombreRol: decoded.NombreRol,
          idEmpleado: results.length > 0 ? results[0].idEmpleado : null
        };

        next();
      });
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado. Inicia sesión nuevamente." 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: "Token inválido." 
      });
    }

    console.error("Error al verificar token:", error);
    return res.status(500).json({ 
      message: "Error al verificar autenticación" 
    });
  }
};


export const verifyToken = autenticar;


export const verifyAdmin = (req, res, next) => {
  if (!req.usuarioAutenticado || req.usuarioAutenticado.NombreRol !== "Administrador") {
    return res.status(403).json({ 
      message: "Acceso denegado. Se requieren permisos de administrador." 
    });
  }
  next();
};


export const verifyTokenAndAdmin = (req, res, next) => {
  autenticar(req, res, (err) => {
    if (err) return;
    verifyAdmin(req, res, next);
  });
};


// Middleware para verificar que solo empleados o administradores puedan acceder
export const verificarEmpleado = (req, res, next) => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ 
      message: "Acceso denegado. Usuario no autenticado." 
    });
  }

  // Verificar que el rol sea Empleado o Administrador
  const rolesPermitidos = ["Empleado", "Administrador"];
  if (!rolesPermitidos.includes(req.usuarioAutenticado.NombreRol)) {
    return res.status(403).json({ 
      message: "Acceso denegado. Solo empleados pueden usar la mensajería interna." 
    });
  }

  // Verificar que tenga idEmpleado
  if (!req.usuarioAutenticado.idEmpleado) {
    return res.status(403).json({ 
      message: "Acceso denegado. No se encontró registro de empleado." 
    });
  }

  next();
};