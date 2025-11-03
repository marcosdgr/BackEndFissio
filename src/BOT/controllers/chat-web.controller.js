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

  // 6. Guardar la conversación completa (pregunta + respuesta) en UN solo registro
  const query = "INSERT INTO chatbot (sessionId, preguntaUsuario, respuestaBot, origen) VALUES (?, ?, ?, ?)";
  const valores = [sessionId, message, respuesta, "usuario"];

  console.log(" Guardando conversación completa...");
  console.log("Query:", query);
  console.log("Valores:", valores);

  db.query(query, valores, (error, resultado) => {
    if (error) {
      console.error("ERROR COMPLETO:", error);
      console.error("Código de error:", error.code);
      console.error("Mensaje:", error.sqlMessage);
      return res.status(500).json({ 
        error: "Error al guardar la conversación",
        detalles: error.sqlMessage 
      });
    }

    console.log("✅ Conversación guardada. ID:", resultado.insertId);

    // 7. Enviar respuesta al cliente
    res.json({ 
      reply: respuesta,
      sessionId: sessionId
    });
  });
};