export function chatPrincipal(usuario, mensaje) {
  const mensajeLower = mensaje.toLowerCase().trim();

  // Comando especial para volver al menú desde cualquier punto
  if (mensajeLower === "menu" || mensajeLower === "volver") {
    usuario.step = "waiting_option";
    return `${usuario.name}, te muestro el menú nuevamente:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
  }

  //  PRIMERA INTERACCIÓN: PEDIR NOMBRE 
  if (!usuario.step) {
    if (mensajeLower === "hola" || mensajeLower === "hey" || mensajeLower === "hi") {
      return "¡Hola! 👋\n\nPor favor, decime tu nombre para poder ayudarte mejor.";
    }
    
    usuario.name = mensaje;
    usuario.step = "waiting_option";
    return `¡Perfecto ${usuario.name}! 😊\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
  }

  //  MENÚ PRINCIPAL 
  if (usuario.step === "waiting_option") {
    switch (mensaje) {
      case "1": 
        usuario.step = "servicios_submenu";
        return `🏥 **Servicios de Kinesiología**\n\nContamos con las siguientes especialidades:\n\n1️⃣ Rehabilitación Física\n2️⃣ Masoterapia y Relajación\n3️⃣ Kinesiología Deportiva\n4️⃣ Terapia Respiratoria\n5️⃣ Rehabilitación Neurológica\n\n0️⃣ Volver al menú principal`;
      
      case "2": 
        usuario.step = "asesor_contacto";
        return `📞 **Contacto con Asesor**\n\n¡Perfecto ${usuario.name}! Un asesor especializado te contactará pronto.\n\n¿Cómo preferís que te contactemos?\n\n1️⃣ Por WhatsApp\n2️⃣ Por Email\n3️⃣ Por Teléfono\n\n0️⃣ Volver al menú principal`;
      
      case "3": 
        usuario.step = "productos_submenu";
        return `🛒 **Productos Ergonómicos**\n\nTenemos productos para mejorar tu salud postural:\n\n1️⃣ Sillas Ergonómicas\n2️⃣ Fajas Lumbares\n3️⃣ Bandas de Ejercicio\n4️⃣ Pelotas de Rehabilitación\n5️⃣ Plantillas Ortopédicas\n\n0️⃣ Volver al menú principal`;
      
      case "4": 
        usuario.step = "soporte_problema";
        return `🔧 **Soporte Técnico**\n\nEstoy acá para ayudarte ${usuario.name}.\n\n¿Qué tipo de problema estás teniendo?\n\n1️⃣ Problemas con turnos\n2️⃣ Problemas con pagos\n3️⃣ Problemas con mi cuenta\n4️⃣ Otro problema\n\n0️⃣ Volver al menú principal`;
      
      default: 
        return `¡Perfecto ${usuario.name}! 😊\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }
  }

  //  SUBMENÚ: SERVICIOS 
  if (usuario.step === "servicios_submenu") {
    if (mensaje === "0") {
      usuario.step = "waiting_option";
      return `${usuario.name}, te muestro el menú principal:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }

    switch (mensaje) {
      case "1":
        usuario.step = "servicio_agendar";
        usuario.servicio = "Rehabilitación Física";
        return `✅ **Rehabilitación Física**\n\nEspecializada en recuperación de lesiones, cirugías y accidentes.\n\nIncluye:\n• Evaluación kinésica completa\n• Plan de tratamiento personalizado\n• Ejercicios terapéuticos\n• Técnicas manuales\n\n**Duración:** 45-60 minutos\n**Precio:** $8.000 por sesión\n\n¿Querés agendar una cita?\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
      
      case "2":
        usuario.step = "servicio_agendar";
        usuario.servicio = "Masoterapia";
        return `💆 **Masoterapia y Relajación**\n\nTerapia de masajes para aliviar tensiones y dolores musculares.\n\nIncluye:\n• Masaje descontracturante\n• Técnicas de liberación miofascial\n• Aplicación de calor/frío\n• Estiramientos asistidos\n\n**Duración:** 60 minutos\n**Precio:** $7.000 por sesión\n\n¿Querés agendar una cita?\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
      
      case "3":
        usuario.step = "servicio_agendar";
        usuario.servicio = "Kinesiología Deportiva";
        return `⚽ **Kinesiología Deportiva**\n\nPrevención y recuperación de lesiones deportivas.\n\nIncluye:\n• Evaluación funcional deportiva\n• Entrenamiento de fuerza\n• Prevención de lesiones\n• Retorno al deporte\n\n**Duración:** 60 minutos\n**Precio:** $9.000 por sesión\n\n¿Querés agendar una cita?\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
      
      case "4":
        usuario.step = "servicio_agendar";
        usuario.servicio = "Terapia Respiratoria";
        return `🫁 **Terapia Respiratoria**\n\nMejora tu función respiratoria y capacidad pulmonar.\n\nIncluye:\n• Ejercicios respiratorios\n• Drenaje bronquial\n• Reeducación respiratoria\n• Nebulizaciones\n\n**Duración:** 45 minutos\n**Precio:** $7.500 por sesión\n\n¿Querés agendar una cita?\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
      
      case "5":
        usuario.step = "servicio_agendar";
        usuario.servicio = "Rehabilitación Neurológica";
        return `🧠 **Rehabilitación Neurológica**\n\nPara pacientes con ACV, Parkinson, esclerosis múltiple, etc.\n\nIncluye:\n• Reeducación motora\n• Trabajo de equilibrio y marcha\n• Técnicas de Bobath\n• Terapia manual especializada\n\n**Duración:** 60 minutos\n**Precio:** $10.000 por sesión\n\n¿Querés agendar una cita?\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
      
      default:
        return `Opción no válida. Elegí entre:\n\n1️⃣ Rehabilitación Física\n2️⃣ Masoterapia\n3️⃣ Kinesiología Deportiva\n4️⃣ Terapia Respiratoria\n5️⃣ Rehabilitación Neurológica\n\n0️⃣ Volver al menú`;
    }
  }

  //  AGENDAR SERVICIO 
  if (usuario.step === "servicio_agendar") {
    if (mensaje === "0") {
      usuario.step = "waiting_option";
      return `${usuario.name}, te muestro el menú principal:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }

    if (mensaje === "1") {
      usuario.step = "completed";
      return `✅ ¡Perfecto ${usuario.name}!\n\nPara agendar tu cita de **${usuario.servicio}**, por favor ingresá a nuestra página web en la sección "Turnos Online" o llamanos al:\n\n📞 **0810-555-FISIO (3474)**\n\nHorarios de atención:\n🕐 Lunes a Viernes: 8:00 a 20:00hs\n🕐 Sábados: 9:00 a 13:00hs\n\n¿Necesitás algo más?\nEscribí **"menu"** para volver al inicio.`;
    }

    if (mensaje === "2") {
      usuario.step = "servicios_submenu";
      return `🏥 **Servicios de Kinesiología**\n\n1️⃣ Rehabilitación Física\n2️⃣ Masoterapia y Relajación\n3️⃣ Kinesiología Deportiva\n4️⃣ Terapia Respiratoria\n5️⃣ Rehabilitación Neurológica\n\n0️⃣ Volver al menú principal`;
    }

    return `Por favor elegí:\n\n1️⃣ Sí, agendar ahora\n2️⃣ Ver otros servicios\n0️⃣ Volver al menú`;
  }

  //  CONTACTO ASESOR 
  if (usuario.step === "asesor_contacto") {
    if (mensaje === "0") {
      usuario.step = "waiting_option";
      return `${usuario.name}, te muestro el menú principal:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }

    switch (mensaje) {
      case "1":
        usuario.step = "completed";
        return `📱 **Contacto por WhatsApp**\n\n¡Perfecto ${usuario.name}! Comunicate con nosotros al:\n\n** 3813541077 **\n\nUn asesor te responderá en breve.\n\nEscribí **"menu"** si necesitás algo más.`;
      
      case "2":
        usuario.step = "completed";
        return `📧 **Contacto por Email**\n\n¡Perfecto ${usuario.name}! Envianos tu consulta a:\n\n**info@fissio.com.ar**\n\nTe responderemos dentro de las 24hs hábiles.\n\nEscribí **"menu"** si necesitás algo más.`;
      
      case "3":
        usuario.step = "completed";
        return `📞 **Contacto Telefónico**\n\n¡Perfecto ${usuario.name}! Llamanos al:\n\n**0810-555-FISIO (3474)**\n\nHorarios de atención:\n🕐 Lunes a Viernes: 8:00 a 20:00hs\n🕐 Sábados: 9:00 a 13:00hs\n\nEscribí **"menu"** si necesitás algo más.`;
      
      default:
        return `Elegí cómo preferís que te contactemos:\n\n1️⃣ WhatsApp\n2️⃣ Email\n3️⃣ Teléfono\n\n0️⃣ Volver al menú`;
    }
  }

  //  PRODUCTOS 
  if (usuario.step === "productos_submenu") {
    if (mensaje === "0") {
      usuario.step = "waiting_option";
      return `${usuario.name}, te muestro el menú principal:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }

    usuario.step = "completed";
    switch (mensaje) {
      case "1":
        return `💺 **Sillas Ergonómicas**\n\nPrevení dolores de espalda con nuestras sillas de alta gama.\n\n✅ Respaldo lumbar ajustable\n✅ Altura regulable\n✅ Apoyabrazos 3D\n\n**Desde $45.000**\n\nVisitá nuestra tienda online: www.fissio.com.ar/tienda\n\nEscribí **"menu"** para volver.`;
      
      case "2":
        return `🏥 **Fajas Lumbares**\n\nSoporte y protección para tu espalda.\n\n✅ Varios talles\n✅ Material transpirable\n✅ Varillas de soporte\n\n**Desde $12.000**\n\nVisitá nuestra tienda online: www.fissio.com.ar/tienda\n\nEscribí **"menu"** para volver.`;
      
      case "3":
        return `🏋️ **Bandas de Ejercicio**\n\nIdeal para rehabilitación y entrenamiento.\n\n✅ Set de 5 resistencias\n✅ Con anclaje para puerta\n✅ Incluye guía de ejercicios\n\n**$8.500**\n\nVisitá nuestra tienda online: www.fissio.com.ar/tienda\n\nEscribí **"menu"** para volver.`;
      
      case "4":
        return `⚽ **Pelotas de Rehabilitación**\n\nPara ejercicios de equilibrio y fortalecimiento.\n\n✅ Tamaños: 55cm, 65cm, 75cm\n✅ Material anti-burst\n✅ Incluye inflador\n\n**$6.500**\n\nVisitá nuestra tienda online: www.fissio.com.ar/tienda\n\nEscribí **"menu"** para volver.`;
      
      case "5":
        return `👟 **Plantillas Ortopédicas**\n\nAlivio para pies planos, fascitis y más.\n\n✅ Evaluación por kinesiólogo\n✅ Diseño personalizado\n✅ Material premium\n\n**$18.000**\n\nPedí tu turno para evaluación.\n\nEscribí **"menu"** para volver.`;
      
      default:
        return `Elegí un producto:\n\n1️⃣ Sillas Ergonómicas\n2️⃣ Fajas Lumbares\n3️⃣ Bandas de Ejercicio\n4️⃣ Pelotas de Rehabilitación\n5️⃣ Plantillas Ortopédicas\n\n0️⃣ Volver al menú`;
    }
  }

  //  SOPORTE 
  if (usuario.step === "soporte_problema") {
    if (mensaje === "0") {
      usuario.step = "waiting_option";
      return `${usuario.name}, te muestro el menú principal:\n\n1️⃣ Servicios de Kinesiología\n2️⃣ Hablar con un Asesor\n3️⃣ Productos Ergonómicos\n4️⃣ Soporte Técnico`;
    }

    usuario.step = "completed";
    switch (mensaje) {
      case "1":
        return `📅 **Soporte con Turnos**\n\nPara gestionar tus turnos:\n\n• Cancelar turno: Llamá 24hs antes\n• Modificar turno: Desde tu cuenta web\n• Consultar turnos: www.fissio.com.ar/misturnos\n\n📞 Contactanos: 0810-555-FISIO (3474)\n\nEscribí **"menu"** para volver.`;
      
      case "2":
        return `💳 **Soporte con Pagos**\n\nMétodos de pago aceptados:\n\n✅ Efectivo\n✅ Débito/Crédito\n✅ Transferencia\n✅ Mercado Pago\n✅ Obras Sociales\n\nPara consultas de facturación:\n📧 facturacion@fissio.com.ar\n\nEscribí **"menu"** para volver.`;
      
      case "3":
        return `👤 **Soporte de Cuenta**\n\nProblemas con tu cuenta:\n\n• ¿Olvidaste tu contraseña? → www.fissio.com.ar/recuperar\n• ¿Querés actualizar datos? → Ingresá a tu perfil\n• ¿No podés ingresar? → Contactanos\n\n📧 soporte@fissio.com.ar\n\nEscribí **"menu"** para volver.`;
      
      case "4":
        return `🔧 **Otro Problema**\n\n${usuario.name}, describinos tu problema y te ayudaremos:\n\n📧 Email: soporte@fissio.com.ar\n📞 Teléfono: 0810-555-FISIO (3474)\n💬 WhatsApp: +54 9 11 5555-1234\n\nHorario de atención:\nLun-Vie: 8:00 a 20:00hs\n\nEscribí **"menu"** para volver.`;
      
      default:
        return `Elegí el tipo de problema:\n\n1️⃣ Problemas con turnos\n2️⃣ Problemas con pagos\n3️⃣ Problemas con mi cuenta\n4️⃣ Otro problema\n\n0️⃣ Volver al menú`;
    }
  }

  //  CONVERSACIÓN COMPLETADA 
  if (usuario.step === "completed") {
    return `Gracias por contactarnos, ${usuario.name} 😊\n\n¿Necesitás algo más?\n\nEscribí **"menu"** para ver las opciones nuevamente.`;
  }

  //  FALLBACK 
  delete usuario.step;
  delete usuario.name;
  return "Disculpá, hubo un error. Escribí tu nombre para comenzar de nuevo.";
}