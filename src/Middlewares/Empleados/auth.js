import jwt from "jsonwebtoken";

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ 
      message: "Acceso denegado. No se proporcionó token." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(403).json({ 
      message: "Token inválido o expirado" 
    });
  }
};

// Middleware para verificar si es administrador
export const verifyAdmin = (req, res, next) => {
  if (req.user.NombreRol !== "Administrador") {
    return res.status(403).json({ 
      message: "Acceso denegado. Se requieren permisos de administrador." 
    });
  }
  next();
};

// Middleware que combina verificación de token y admin
export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return;
    verifyAdmin(req, res, next);
  });
};