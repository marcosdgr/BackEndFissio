# 🧪 Instructivo para Probar la API - Mensajería Interna con JWT

## ⚡ Inicio rápido

### 1️⃣ Inicia el servidor
```bash
npm run dev
```

Deberías ver:
```
Servidor corriendo en el puerto 3000 ✅
✅ Conexión exitosa a la base de datos MySQL
```

---

## 📝 Paso 1: Login (obtener token)

### 🔐 Con Postman / Thunder Client / Insomnia

```
Método: POST
URL: http://localhost:3000/api/auth/login
Headers:
  Content-Type: application/json

Body (JSON):
{
  "MailUsuario": "empleado@fissio.com",
  "PasswordUsuario": "123456"
}
```

### 🧪 Usuarios disponibles en tu BD:

| Email | Password | Rol | idUsuario |
|-------|----------|-----|-----------|
| `admin@fissio.com` | `123456` | Administrador | 1 |
| `empleado@fissio.com` | `123456` | Empleado | 2 |
| `paciente@fissio.com` | `123456` | Paciente | 3 |
| `karenherrera95@gmail.com` | `1234` | Empleado | 4 |

### ✅ Respuesta exitosa:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjIsIk1haWxVc3VhcmlvIjoiZW1wbGVhZG9AZmlzc2lvLmNvbSIsIk5vbWJyZVJvbCI6IkVtcGxlYWRvIiwiaWRFbXBsZWFkbyI6MSwiaWF0IjoxNjk4ODY0MDAwLCJleHAiOjE2OTg5NTA0MDB9.abc123...",
  "usuario": {
    "idUsuario": 2,
    "MailUsuario": "empleado@fissio.com",
    "NombreRol": "Empleado",
    "idEmpleado": 1,
    "nombre": "María Gómez"
  }
}
```

**🎯 IMPORTANTE:** Guarda el `token` para usarlo en las siguientes peticiones.

---

## 🔑 Paso 2: Usar el token

En **todas las siguientes peticiones**, agrega el header:
```
Authorization: Bearer {PEGA_AQUI_EL_TOKEN}
```

---

## 📨 Paso 3: Enviar mensaje

```
Método: POST
URL: http://localhost:3000/api/mensajes-internos/v1/enviar
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (JSON):
{
  "mensaje": "Hola equipo, recordar cita del paciente!",
  "destinatarios": [2, 3]
}
```

### 📋 Destinatarios disponibles (IDs de empleados):
- `1` → María Gómez
- `2` → Carlos Pérez  
- `3` → Lucía Rodríguez
- `4` → Javier Luna
- `5` → Sofía Martínez
- `6` → Diego Suárez
- `7` → Camila Fernández
- `8` → Pablo Ríos

### ✅ Respuesta:
```json
{
  "message": "Mensaje enviado exitosamente",
  "idNotificacion": 5
}
```

---

## 💬 Paso 4: Ver conversación

```
Método: GET
URL: http://localhost:3000/api/mensajes-internos/v1/conversacion/2/3
Headers:
  Authorization: Bearer TOKEN
```

**🔒 Nota:** Solo puedes ver conversaciones donde TÚ seas uno de los participantes.

### ✅ Respuesta:
```json
[
  {
    "idNotificacion": 1,
    "Mensaje": "Hola equipo!",
    "FechaEnvio": "2025-11-01T14:30:00.000Z",
    "Leido": 0,
    "idRemitente": 2,
    "Remitente": "empleado@fissio.com",
    "NombreDestinatario": "Carlos",
    "ApellidoDestinatario": "Pérez",
    "idEmpleadoDestinatario": 2
  }
]
```

---

## ✅ Paso 5: Marcar como leído

```
Método: PUT
URL: http://localhost:3000/api/mensajes-internos/v1/leido
Headers:
  Authorization: Bearer TOKEN
  Content-Type: application/json

Body (JSON):
{
  "idNotificacion": 1,
  "idEmpleadoDestinatario": 2
}
```

**🔒 Nota:** Solo puedes marcar como leídos TUS propios mensajes.

### ✅ Respuesta:
```json
{
  "message": "Mensaje marcado como leído"
}
```

---

## 🔐 Rutas adicionales de autenticación

### Verificar si el token es válido

```
Método: GET
URL: http://localhost:3000/api/auth/verificar
Headers:
  Authorization: Bearer TOKEN
```

**✅ Respuesta:**
```json
{
  "message": "Token válido",
  "usuario": {
    "idUsuario": 2,
    "MailUsuario": "empleado@fissio.com",
    "NombreRol": "Empleado",
    "idEmpleado": 1
  }
}
```

### Logout

```
Método: POST
URL: http://localhost:3000/api/auth/logout
Headers:
  Authorization: Bearer TOKEN
```

---

## 🧪 Pruebas con PowerShell

### 1. Login y guardar token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"MailUsuario":"empleado@fissio.com","PasswordUsuario":"123456"}'

$token = $response.token
Write-Host "Token obtenido: $token" -ForegroundColor Green
Write-Host "Usuario: $($response.usuario.nombre)" -ForegroundColor Cyan
```

### 2. Enviar mensaje
```powershell
$body = @{
  mensaje = "Hola equipo desde PowerShell!"
  destinatarios = @(2, 3)
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/mensajes-internos/v1/enviar" `
  -Method POST `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $body
```

### 3. Ver conversación
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mensajes-internos/v1/conversacion/2/3" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json -Depth 10
```

---

## 🧪 Pruebas con cURL (Git Bash / Linux / Mac)

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"MailUsuario":"empleado@fissio.com","PasswordUsuario":"123456"}'
```

### 2. Enviar mensaje (reemplaza TOKEN)
```bash
curl -X POST http://localhost:3000/api/mensajes-internos/v1/enviar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"mensaje":"Hola desde cURL!","destinatarios":[2,3]}'
```

### 3. Ver conversación
```bash
curl -X GET http://localhost:3000/api/mensajes-internos/v1/conversacion/2/3 \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎯 Flujo completo de prueba paso a paso

### Escenario: María (idEmpleado=1) envía mensaje a Carlos (idEmpleado=2)

1. **Login como María:**
   ```json
   POST /api/auth/login
   {
     "MailUsuario": "empleado@fissio.com",
     "PasswordUsuario": "123456"
   }
   ```
   ➡️ **Copiar el token**

2. **Enviar mensaje a Carlos:**
   ```json
   POST /api/mensajes-internos/v1/enviar
   Authorization: Bearer TOKEN_DE_MARIA
   {
     "mensaje": "Hola Carlos, necesito que revises el informe",
     "destinatarios": [2]
   }
   ```

3. **Hacer login como Carlos** (si tienes su usuario, o usa otro empleado)

4. **Ver la conversación:**
   ```
   GET /api/mensajes-internos/v1/conversacion/1/2
   Authorization: Bearer TOKEN_DE_CARLOS
   ```

5. **Marcar como leído:**
   ```json
   PUT /api/mensajes-internos/v1/leido
   Authorization: Bearer TOKEN_DE_CARLOS
   {
     "idNotificacion": 1,
     "idEmpleadoDestinatario": 2
   }
   ```

---

## ⚠️ Errores comunes

### Error 400 - Bad Request
```json
{
  "message": "Mensaje y destinatarios son requeridos"
}
```
**Solución:** Verifica que enviaste `mensaje` y `destinatarios` en el body.

### Error 401 - Unauthorized
```json
{
  "message": "Acceso denegado. No se proporcionó token."
}
```
**Solución:** Agrega el header `Authorization: Bearer TOKEN`

### Error 403 - Forbidden
```json
{
  "message": "No tienes permisos para ver esta conversación"
}
```
**Solución:** Solo puedes ver conversaciones donde TÚ seas uno de los participantes.

### Error 401 - Token Expirado
```json
{
  "message": "Token expirado. Inicia sesión nuevamente."
}
```
**Solución:** Haz login nuevamente (el token expira en 24 horas).

---

## 🔒 Validaciones de seguridad implementadas

✅ **Contraseñas hasheadas** con bcrypt  
✅ **Token JWT obligatorio** en rutas protegidas  
✅ **idRemitente automático** extraído del token (no se puede falsificar)  
✅ **Solo empleados** pueden enviar mensajes internos  
✅ **Validación de conversaciones** (solo ves las tuyas)  
✅ **Validación de lectura** (solo marcas tus mensajes)  

---

## 📊 Estructura de datos

### Token JWT decodificado contiene:
```json
{
  "idUsuario": 2,
  "MailUsuario": "empleado@fissio.com",
  "NombreRol": "Empleado",
  "idEmpleado": 1,
  "iat": 1698864000,
  "exp": 1698950400
}
```

### Tablas involucradas:
- **usuarios** → Autenticación (login)
- **empleados** → Remitentes y destinatarios de mensajes
- **notificaciones** → Mensajes (vinculados a usuarios)
- **notificaciones_destinatarios** → Puente N:M (vinculados a empleados)

---

## ⏰ Información importante

- **Expiración del token:** 24 horas
- **Puerto del servidor:** 3000
- **Base de datos:** fissio2
- **Algoritmo JWT:** HS256

---

## 🎓 Tips para pruebas

1. **Usa Postman o Thunder Client** (extensión de VS Code) para pruebas más cómodas
2. **Guarda el token en una variable de entorno** en Postman para no copiarlo cada vez
3. **Revisa la consola del servidor** para ver errores detallados
4. **Verifica en MySQL** que los datos se insertaron correctamente
5. **Prueba con diferentes roles** (Admin, Empleado, Paciente)

---

## ✅ Checklist de pruebas

- [ ] Login con usuario válido
- [ ] Login con contraseña incorrecta (debe fallar)
- [ ] Login con usuario inactivo (debe fallar)
- [ ] Enviar mensaje sin token (debe fallar 401)
- [ ] Enviar mensaje con token válido (debe funcionar)
- [ ] Enviar mensaje sin destinatarios (debe fallar 400)
- [ ] Ver conversación propia (debe funcionar)
- [ ] Ver conversación de otros (debe fallar 403)
- [ ] Marcar como leído mensaje propio (debe funcionar)
- [ ] Marcar como leído mensaje de otros (debe fallar 403)
- [ ] Verificar token válido (debe funcionar)
- [ ] Usar token expirado (debe fallar 401)
