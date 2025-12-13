import { Router } from "express";
import { responderChatWeb } from "../controllers/chat-web.controller.js";

const router = Router();

// Endpoint POST para el chatbot 
router.post("/chat", responderChatWeb);

// Endpoint GET para verificar que el servicio está funcionando
router.get("/chat", (req, res) => {
  res.json({ 
    message: "✅ Chatbot API funcionando correctamente",
    info: "Este es un endpoint POST. Envía un JSON con { message: 'tu mensaje', sessionId: 'opcional' }",
    example: {
      method: "POST",
      url: "/api/chat-web/v1/chat",
      body: {
        message: "Hola",
        sessionId: null
      }
    }
  });
});

export default router;