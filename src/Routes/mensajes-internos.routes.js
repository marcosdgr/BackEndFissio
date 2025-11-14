import express from "express";
import { 
  enviarNotificacion, 
  marcarLeido, 
  obtenerConversacion,
  registrarHeartbeat 
} from "../Controllers/Mensajeria/mensajes-internos.controller.js";
import { autenticar, verificarEmpleado } from "../Middlewares/mensajeriaInterna/autenticar.js";
import { 
  validarEnviarMensaje, 
  validarRemitenteAutenticado, 
  validarAccesoMensaje,
  validarMarcarLeido 
} from "../Middlewares/mensajeriaInterna/validarMensaje.js";

const router = express.Router();

// Todas las rutas requieren autenticación y ser empleado
router.use(autenticar);
router.use(verificarEmpleado);

// Enviar mensaje
router.post("/enviar", validarEnviarMensaje, validarRemitenteAutenticado, enviarNotificacion);

// Obtener conversación
router.get("/conversacion/:idUser1/:idUser2", validarAccesoMensaje, obtenerConversacion);

// Marcar como leído
router.put("/leido", validarMarcarLeido, marcarLeido);

// Registrar actividad del usuario (heartbeat)
router.post("/heartbeat", registrarHeartbeat);

export default router;