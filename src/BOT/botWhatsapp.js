import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { chatPrincipal } from "./services/chatPrincipal.service.js";
import db from "../Config/db.js";

const client = new Client();
const estadosUsuarios = {};

// Evento cuando el cliente está listo
client.on("ready", () => {
  console.log("✅ Bot de WhatsApp conectado y listo!");
});

// Evento para mostrar el código QR en la consola
client.on("qr", (qr) => {
  console.log("\n📱 Escanea este código QR con WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

// Evento cuando llega un mensaje
client.on("message", async (message) => {
  const userId = message.from;
  const userMessage = message.body.trim();
  
  // Inicializar estado del usuario
  if (!estadosUsuarios[userId]) estadosUsuarios[userId] = {};
  
  // Generar respuesta
  const respuesta = chatPrincipal(estadosUsuarios[userId], userMessage);
  
  // Guardar en la base de datos
  const query = "INSERT INTO chatbot (sessionId, preguntaUsuario, respuestaBot, origen) VALUES (?, ?, ?, ?)";
  const valores = [userId, userMessage, respuesta, "usuario"];
  
  db.query(query, valores, (error, resultado) => {
    if (error) {
      console.error("❌ Error al guardar mensaje de WhatsApp:", error.sqlMessage);
    } else {
      console.log("✅ Mensaje de WhatsApp guardado. ID:", resultado.insertId);
    }
  });
  
  // Enviar respuesta
  await message.reply(respuesta);
});

// Evento cuando se desconecta
client.on("disconnected", (reason) => {
  console.log(" Bot desconectado:", reason);
});

console.log(" Iniciando bot de WhatsApp...");
client.initialize();