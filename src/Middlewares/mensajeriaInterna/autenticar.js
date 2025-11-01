import jwt from 'jsonwebtoken';

// Middleware de autenticación con JWT
export const verificarAutenticacion = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'Token no proporcionado. Debes iniciar sesión' 
    });
  }

  // Formato esperado: "Bearer TOKEN"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Formato de token inválido. Usa: Bearer TOKEN' 
    });
  }
  
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_super_segura');
    
    // Guardar información del usuario autenticado en req
    req.usuarioAutenticado = {
      idUsuario: decoded.idUsuario,
      email: decoded.email,
      rol: decoded.rol,
      idEmpleado: decoded.idEmpleado || null
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado. Por favor, inicia sesión nuevamente' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error al verificar token',
      error: error.message 
    });
  }
};

// Función auxiliar para generar tokens (puedes usarla en tu login)
export const generarToken = (usuario) => {
  const payload = {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    rol: usuario.rol,
    idEmpleado: usuario.idEmpleado || null
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
    { expiresIn: '24h' } // El token expira en 24 horas
  );
};
