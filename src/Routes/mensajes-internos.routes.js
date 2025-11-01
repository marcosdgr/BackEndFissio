import express from "express";
import { enviarNotificacion, marcarLeido, obtenerConversacion } from "../Controllers/mensajes-internos.controller.js";
import { verificarAutenticacion } from "../Middlewares/mensajeriaInterna/autenticar.js";
import { 
  validarEnviarMensaje, 
  validarRemitenteAutenticado, 
  validarAccesoMensaje,
  validarMarcarLeido 
} from "../Middlewares/mensajeriaInterna/validarMensaje.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Enviar mensaje - valida datos y que el remitente sea el usuario autenticado
router.post("/enviar", validarEnviarMensaje, validarRemitenteAutenticado, enviarNotificacion);

// Obtener conversación - valida que el usuario sea parte de la conversación
router.get("/conversacion/:idUser1/:idUser2", validarAccesoMensaje, obtenerConversacion);

// Marcar como leído - valida que solo pueda marcar sus propios mensajes
router.put("/leido", validarMarcarLeido, marcarLeido);

export default router;