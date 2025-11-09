import express from "express";
import { enviarNotificacion, marcarLeido, obtenerConversacion } from "../Controllers/Mensajeria/mensajes-internos.controller.js";
import { autenticar } from "../Middlewares/mensajeriaInterna/autenticar.js";
import { 
  validarEnviarMensaje, 
  validarRemitenteAutenticado, 
  validarAccesoMensaje,
  validarMarcarLeido 
} from "../Middlewares/mensajeriaInterna/validarMensaje.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// Enviar mensaje - valida datos y que el remitente sea el usuario autenticado
router.post("/enviar", validarEnviarMensaje, validarRemitenteAutenticado, enviarNotificacion);

// Obtener conversación - valida que el usuario sea parte de la conversación
router.get("/conversacion/:idUser1/:idUser2", validarAccesoMensaje, obtenerConversacion);

// Marcar como leído - valida que solo pueda marcar sus propios mensajes
router.put("/leido", validarMarcarLeido, marcarLeido);

// Registrar actividad del usuario (heartbeat)
router.post("/heartbeat", (req, res) => {
  try {
    const idUsuario = req.usuarioAutenticado.idUsuario;
    // Aquí podrías guardar en caché o BD el último heartbeat
    res.status(200).json({ message: "Heartbeat registrado", timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ message: "Error en heartbeat" });
  }
});

export default router;