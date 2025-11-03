-- Crear tabla para mensajes del chat web
CREATE TABLE IF NOT EXISTS mensajes_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sessionId VARCHAR(255) NOT NULL,
  canal ENUM('web', 'whatsapp') DEFAULT 'web',
  remitente ENUM('usuario', 'bot') NOT NULL,
  texto TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (sessionId),
  INDEX idx_fecha (fecha)
);

-- Crear tabla para estadísticas del chat
CREATE TABLE IF NOT EXISTS estadisticas_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consulta VARCHAR(100) UNIQUE NOT NULL,
  cantidad INT DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
