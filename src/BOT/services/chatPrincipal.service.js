export function chatPrincipal(usuario, mensaje) {
  if (!usuario.step) usuario.step = "start";

  if (usuario.step === "start") {
    usuario.step = "waiting_name";
    return "¡Hola! Bienvenido a Fissio 👋\n\n¿Cuál es tu nombre?";
  }

  if (usuario.step === "waiting_name") {
    usuario.name = mensaje;
    usuario.step = "waiting_option";
    return `¡Perfecto ${usuario.name}! 😊\n\n¿En qué puedo ayudarte hoy?\n1️⃣ Servicios\n2️⃣ Asesor\n3️⃣ Productos\n4️⃣ Soporte`;
  }

  if (usuario.step === "waiting_option") {
    usuario.step = "start";
    switch (mensaje) {
      case "1": return `Ofrecemos tratamientos de kinesiología, rehabilitación y masoterapia.`;
      case "2": return `Un asesor se pondrá en contacto con vos pronto.`;
      case "3": return `Podés ver nuestros productos ergonómicos en la sección Tienda.`;
      case "4": return `Contanos brevemente tu problema técnico.`;
      default: return `No entendí 😅, escribí un número del 1 al 4.`;
    }
  }
}