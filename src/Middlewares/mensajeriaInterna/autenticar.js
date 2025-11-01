import jwt from "jsonwebtoken";

// Generar token JWT
export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h"
  });
};

// Middleware principal para autenticar (alias: autenticar)
export const autenticar = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "Acceso denegado. No se proporcionó token." 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar info del usuario autenticado al request
    req.usuarioAutenticado = {
      idUsuario: decoded.idUsuario,
      MailUsuario: decoded.MailUsuario,
      NombreRol: decoded.NombreRol,
      idEmpleado: decoded.idEmpleado || null
    };

    next();
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

// Alias para compatibilidad
export const verifyToken = autenticar;

// Middleware para verificar si es administrador
export const verifyAdmin = (req, res, next) => {
  if (!req.usuarioAutenticado || req.usuarioAutenticado.NombreRol !== "Administrador") {
    return res.status(403).json({ 
      message: "Acceso denegado. Se requieren permisos de administrador." 
    });
  }
  next();
};

// Middleware que combina verificación de token y admin
export const verifyTokenAndAdmin = (req, res, next) => {
  autenticar(req, res, (err) => {
    if (err) return;
    verifyAdmin(req, res, next);
  });
};