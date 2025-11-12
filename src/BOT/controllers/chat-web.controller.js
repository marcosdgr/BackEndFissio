import db from "../../Config/db.js";
import { chatPrincipal } from "../services/chatPrincipal.service.js";
import { v4 as uuidv4 } from "uuid";

// Estado temporal de usuarios (guarda las conversaciones en memoria)
const estadosChat = {};

// Función para responder al chat web
export const responderChatWeb = (req, res) => {
  // 1. Obtener datos del body
  let sessionId = req.body.sessionId;
  const message = req.body.message;

  // 2. Generar sessionId si no existe (para usuarios anónimos/no logueados)
  if (!sessionId) {
    sessionId = uuidv4();
    console.log(" Nuevo usuario anónimo. SessionId generado:", sessionId);
  }

  // 3. Validar que llegue el mensaje
  if (!message) {
    return res.status(400).json({ 
      error: "El campo 'message' es requerido" 
    });
  }

  // 4. Crear sesión si no existe
  if (!estadosChat[sessionId]) {
    estadosChat[sessionId] = {};
  }

  // 5. Generar respuesta con la lógica del bot
  const respuesta = chatPrincipal(estadosChat[sessionId], message);

  // 5.1. Validar que la respuesta no sea undefined
  if (!respuesta) {
    return res.status(500).json({ 
      error: "Error interno del bot",
      reply: "Disculpá, hubo un error. Intentá de nuevo por favor."
    });
  }

  // 6. Enviar respuesta INMEDIATAMENTE al cliente (no esperar a que se guarde en BD)
  res.json({ 
    reply: respuesta,
    sessionId: sessionId
  });

  // 7. Guardar la conversación en segundo plano (no bloquea la respuesta al usuario)
  const query = "INSERT INTO chatbot (sessionId, preguntaUsuario, respuestaBot, origen) VALUES (?, ?, ?, ?)";
  const valores = [sessionId, message, respuesta, "usuario"];

  db.query(query, valores, (error, resultado) => {
    if (error) {
      console.error("Error al guardar conversación en BD:", error.sqlMessage);
    }
  });
};
