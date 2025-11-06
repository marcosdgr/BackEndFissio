
• LOGUEO DE USUARIO
Método: POST
URL: http://localhost:3000/api/auth/login

Body (JSON):
{
  "MailUsuario": "empleado@fissio.com",
  "PasswordUsuario": "123456"
}


• ENVIAR MENSAJE
Método: POST
URL: http://localhost:3000/api/mensajes-internos/v1/enviar

{
  "mensaje": "Hola equipo, recordar cita del paciente!",
  "destinatarios": [2, 3]
}


• VER CONVERSACION (SOLO PARTICIPANTES)
Método: GET
URL: http://localhost:3000/api/mensajes-internos/v1/conversacion/2/3
Headers:
 
• MARCAR COMO LEIDO(DESDE MAIL DE USUARIO RECEPTOR)
Método: PUT
URL: http://localhost:3000/api/mensajes-internos/v1/leido

Body (JSON):
{
  "idNotificacion": 1,
  "idEmpleadoDestinatario": 2
}



•VERIFICAR TOKEN VALIDO

Método: GET
URL: http://localhost:3000/api/auth/verificar


• LOGOUT
Método: POST
URL: http://localhost:3000/api/auth/logout
