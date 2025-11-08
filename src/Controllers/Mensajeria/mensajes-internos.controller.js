import mensajesInternos from '../../Models/mensajes.js';

// El idRemitente viene del token JWT (usuario autenticado)
export const enviarNotificacion = (req, res) => {
  try {
    const { mensaje, destinatarios } = req.body;
    
    // El idRemitente viene del token JWT (usuario autenticado)
    const idRemitente = req.usuarioAutenticado.idUsuario;

    if (!mensaje || !Array.isArray(destinatarios) || destinatarios.length === 0) {
      return res.status(400).json({ 
        message: "Datos incompletos. Se requiere mensaje y destinatarios" 
      });
    }

    // Validar que destinatarios sean identificadores de empleados válidos
    if (!destinatarios.every(id => Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ 
        message: "Los destinatarios deben ser IDs de empleados válidos" 
      });
    }

    mensajesInternos.crearNotificacion(idRemitente, mensaje, destinatarios, (err, idNotificacion) => {
      if (err) {
        console.error("Error al enviar mensaje:", err);
        return res.status(500).json({ 
          message: "Error al enviar mensaje", 
          error: err.message 
        });
      }
      res.status(201).json({ 
        message: "Mensaje enviado correctamente", 
        idNotificacion,
        remitente: req.usuarioAutenticado.email
      });
    });
  } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ 
      message: "Error del servidor", 
      error: err.message 
    });
  }
};



// los participantes de la conversación son idUser1 e idUser2, pueden ver la conversacion
export const obtenerConversacion = (req, res) => {
  try {
    const { idUser1, idUser2 } = req.params;
    const usuarioAutenticado = req.usuarioAutenticado.idUsuario;

    // Validar que el usuario autenticado sea uno de los participantes
    if (parseInt(idUser1) !== usuarioAutenticado && parseInt(idUser2) !== usuarioAutenticado) {
      return res.status(403).json({ 
        message: "No tienes permiso para ver esta conversación" 
      });
    }
    
    mensajesInternos.obtenerConversacion(idUser1, idUser2, (err, mensajes) => {
      if (err) {
        console.error("Error al obtener conversación:", err);
        return res.status(500).json({ 
          message: "Error al obtener conversación", 
          error: err.message 
        });
      }
      res.status(200).json(mensajes);
    });
  } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ 
      message: "Error del servidor", 
      error: err.message 
    });
  }
};



// el empleado destinatario es el que marca como leido el mensaje
export const marcarLeido = (req, res) => {
  try {
    const { idNotificacion, idEmpleadoDestinatario } = req.body;
    const idEmpleadoAutenticado = req.usuarioAutenticado.idEmpleado;
    
    console.log('🟢 CONTROLLER marcarLeido - Datos recibidos:');
    console.log('  - idNotificacion:', idNotificacion);
    console.log('  - idEmpleadoDestinatario:', idEmpleadoDestinatario);
    console.log('  - idEmpleadoAutenticado:', idEmpleadoAutenticado);
    console.log('  - Usuario completo:', req.usuarioAutenticado);
    
    if (!idNotificacion || !idEmpleadoDestinatario) {
      console.log('❌ Faltan datos requeridos');
      return res.status(400).json({ 
        message: "Faltan datos: idNotificacion e idEmpleadoDestinatario son requeridos" 
      });
    }

    // Validar que el usuario autenticado sea el destinatario
    if (!idEmpleadoAutenticado) {
      console.log('❌ Usuario no es empleado o no tiene idEmpleado');
      return res.status(403).json({ 
        message: "Solo empleados pueden marcar mensajes como leídos" 
      });
    }

    if (parseInt(idEmpleadoDestinatario) !== idEmpleadoAutenticado) {
      console.log('❌ El empleado no coincide con el destinatario');
      return res.status(403).json({ 
        message: "Solo puedes marcar como leídos tus propios mensajes" 
      });
    }

    console.log('✅ Validaciones pasadas, llamando al modelo...');
    mensajesInternos.marcarLeido(idNotificacion, idEmpleadoDestinatario, (err, result) => {
      if (err) {
        console.error("❌ Error al marcar mensaje como leído:", err);
        return res.status(500).json({ 
          message: "Error al marcar mensaje", 
          error: err.message 
        });
      }
      console.log('✅ Mensaje marcado exitosamente. Result:', result);
      res.status(200).json({ 
        message: "Mensaje marcado como leído",
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
    });
  } catch (err) {
    console.error("❌ Error del servidor:", err);
    res.status(500).json({ 
      message: "Error del servidor", 
      error: err.message 
    });
  }
};