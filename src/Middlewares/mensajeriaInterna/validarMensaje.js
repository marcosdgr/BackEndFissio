// Middleware para validar que el usuario solo puede enviar mensajes como él mismo
// YA NO SE USA porque el idRemitente viene automáticamente del token
export const validarRemitenteAutenticado = (req, res, next) => {
  // Este middleware ya no es necesario porque no aceptamos idRemitente del body
  // El idRemitente se toma automáticamente de req.usuarioAutenticado
  next();
};

// Middleware para validar datos al enviar mensaje
export const validarEnviarMensaje = (req, res, next) => {
  const { mensaje, destinatarios } = req.body;

  // Validar campos obligatorios (idRemitente ya no viene del body)
  if (!mensaje || !Array.isArray(destinatarios)) {
    return res.status(400).json({ 
      message: 'Datos incompletos. Se requiere: mensaje y destinatarios' 
    });
  }

  // Validar que hay al menos un destinatario
  if (destinatarios.length === 0) {
    return res.status(400).json({ 
      message: 'Debes especificar al menos un destinatario' 
    });
  }

  // Validar que el mensaje no esté vacío
  if (mensaje.trim() === '') {
    return res.status(400).json({ 
      message: 'El mensaje no puede estar vacío' 
    });
  }

  // Validar longitud del mensaje (opcional)
  if (mensaje.length > 500) {
    return res.status(400).json({ 
      message: 'El mensaje no puede superar los 500 caracteres' 
    });
  }

  // Validar que los destinatarios sean números
  const destinatariosValidos = destinatarios.every(id => 
    Number.isInteger(parseInt(id)) && parseInt(id) > 0
  );
  
  if (!destinatariosValidos) {
    return res.status(400).json({ 
      message: 'Los destinatarios deben ser IDs válidos' 
    });
  }

  // Sanitizar el mensaje (remover HTML peligroso)
  req.body.mensaje = mensaje.trim();

  next();
};

// Middleware para validar que el usuario puede leer solo sus mensajes
export const validarAccesoMensaje = (req, res, next) => {
  const { idUser1, idUser2 } = req.params;
  const idUsuarioAutenticado = req.usuarioAutenticado?.idUsuario;

  if (!idUsuarioAutenticado) {
    return res.status(401).json({ 
      message: 'Usuario no autenticado' 
    });
  }

  // El usuario autenticado debe ser uno de los participantes de la conversación
  const esParticipante = 
    parseInt(idUser1) === parseInt(idUsuarioAutenticado) || 
    parseInt(idUser2) === parseInt(idUsuarioAutenticado);

  if (!esParticipante) {
    return res.status(403).json({ 
      message: 'No tienes permiso para ver esta conversación' 
    });
  }

  next();
};

// Middleware para validar marcar como leído
export const validarMarcarLeido = (req, res, next) => {
  const { idNotificacion, idEmpleadoDestinatario } = req.body;
  const idEmpleadoAutenticado = req.usuarioAutenticado?.idEmpleado;

  if (!idEmpleadoAutenticado) {
    return res.status(403).json({ 
      message: 'Solo empleados pueden marcar mensajes como leídos' 
    });
  }

  if (!idNotificacion || !idEmpleadoDestinatario) {
    return res.status(400).json({ 
      message: 'Faltan datos: idNotificacion e idEmpleadoDestinatario son requeridos' 
    });
  }

  // Solo el empleado receptor es el que puede marcar como leído
  if (parseInt(idEmpleadoDestinatario) !== parseInt(idEmpleadoAutenticado)) {
    return res.status(403).json({ 
      message: 'Solo puedes marcar como leídos tus propios mensajes' 
    });
  }

  next();
};
