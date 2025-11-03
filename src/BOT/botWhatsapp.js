import { Client } from "whatsapp-web.js";
import { chatPrincipal } from "./services/chatPrincipal.service.js";
const client = new Client();
const estadosUsuarios = {};

client.on("message", async (message) => {
  const userId = message.from;
  if (!estadosUsuarios[userId]) estadosUsuarios[userId] = {};
  const respuesta = chatPrincipal(estadosUsuarios[userId], message.body.trim());
  await message.reply(respuesta);
});

client.initialize();