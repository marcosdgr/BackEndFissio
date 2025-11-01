# Guía de uso - Autenticación JWT

## 🔐 Variables de entorno

Asegúrate de tener en tu `.env`:
```
JWT_SECRET=tu_clave_secreta_super_segura_12345_cambiame_en_produccion
```

## � Estructura de tu BD

- **USUARIOS** → Se autentican (login con email/password)
- **EMPLEADOS** → Vinculados a usuarios (reciben y envían mensajes)
- **NOTIFICACIONES** → Enviadas por usuarios, recibidas por empleados


Usa las credenciales de la tabla `usuarios`:

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "empleado@fissio.com",
  "password": "123456"
}
```

**Respuesta exitosa:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "idUsuario": 2,
    "email": "empleado@fissio.com",
    "rol": "Empleado",
    "idEmpleado": 1,
    "nombre": "María Gómez"
  }
}
```

### 🧪 Ejemplos con usuarios reales de tu BD:

```bash
# Administrador
{
  "email": "admin@fissio.com",
  "password": "123456"
}

# Empleado
{
  "email": "empleado@fissio.com",
  "password": "123456"
}

# Paciente
{
  "email": "paciente@fissio.com",
  "password": "123456"
}

# Empleado con usuario vinculado
{
  "email": "karenherrera95@gmail.com",
  "password": "1234"
}
```

## 🔑 Paso 2: Usar el token en las peticiones

Copia el `token` de la respuesta y úsalo en el header `Authorization`:

### Enviar mensaje interno

**IMPORTANTE:** Ya NO necesitas enviar `idRemitente`, se toma del token automáticamente.

```bash
POST http://localhost:3000/api/mensajes-internos/v1/enviar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "mensaje": "Hola equipo, recordar cita del paciente!",
  "destinatarios": [1, 2, 3]
}
```

**Nota:** Los `destinatarios` son **IDs de empleados** (tabla `empleados`):
- 1 → María Gómez
- 2 → Carlos Pérez  
- 3 → Lucía Rodríguez

### Obtener conversación

```bash
GET http://localhost:3000/api/mensajes-internos/v1/conversacion/2/3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota:** Solo puedes ver conversaciones donde TÚ seas uno de los participantes (validación de seguridad).

### Marcar mensaje como leído

```bash
PUT http://localhost:3000/api/mensajes-internos/v1/leido
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "idNotificacion": 1,
  "idEmpleadoDestinatario": 2
}
```

**Nota:** Solo puedes marcar como leídos TUS propios mensajes (validación de seguridad).

## ✅ Verificar token

```bash
GET http://localhost:3000/api/auth/verificar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**
```json
{
  "message": "Token válido",
  "usuario": {
    "idUsuario": 2,
    "email": "empleado@fissio.com",
    "rol": "Empleado",
    "idEmpleado": 1
  }
}
```

## 🚪 Logout

```bash
POST http://localhost:3000/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Ejemplos completos con cURL

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"empleado@fissio.com\", \"password\": \"123456\"}"
```

### 2. Guardar token en variable (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"empleado@fissio.com","password":"123456"}'
$token = $response.token
echo $token
```

### 3. Enviar mensaje con el token
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mensajes-internos/v1/enviar" -Method POST -Headers @{
  "Content-Type"="application/json"
  "Authorization"="Bearer $token"
} -Body '{"mensaje":"Hola equipo!","destinatarios":[1,2,3]}'
```

## 🔒 Seguridad implementada

✅ **Token JWT obligatorio** en todas las rutas de mensajería  
✅ **idRemitente automático** del token (evita suplantación)  
✅ **Validación de conversaciones** (solo ves tus mensajes)  
✅ **Validación de lectura** (solo marcas tus propios mensajes)  
✅ **Verificación de empleado** (solo empleados envían mensajes)  

## 🔒 Códigos de error comunes

- **400 Bad Request** - Datos faltantes o incorrectos
- **401 Unauthorized** - Token no proporcionado, inválido o expirado
- **403 Forbidden** - No tienes permisos para esta acción
  - Intentas ver conversación de otros
  - Intentas marcar mensajes de otros
  - Tu usuario no es empleado

## ⏰ Expiración del token

El token expira en **24 horas**. Después debes hacer login nuevamente.

## 🧪 Flujo de prueba completo

1. **Login como empleado:**
   ```json
   POST /api/auth/login
   {"email": "empleado@fissio.com", "password": "123456"}
   ```

2. **Copiar el token recibido**

3. **Enviar mensaje (sin idRemitente):**
   ```json
   POST /api/mensajes-internos/v1/enviar
   Authorization: Bearer TOKEN
   {"mensaje": "Hola!", "destinatarios": [2, 3]}
   ```

4. **Ver conversación:**
   ```
   GET /api/mensajes-internos/v1/conversacion/2/3
   Authorization: Bearer TOKEN
   ```

5. **Marcar como leído:**
   ```json
   PUT /api/mensajes-internos/v1/leido
   Authorization: Bearer TOKEN
   {"idNotificacion": 1, "idEmpleadoDestinatario": 2}
   ```

## 🛡️ Mejoras recomendadas para PRODUCCIÓN

⚠️ **CRÍTICAS:**
1. ✅ Cambia `JWT_SECRET` por clave muy segura
2. ⚠️ **Hashea las contraseñas con bcrypt** (actualmente en texto plano)
3. ⚠️ Usa HTTPS en producción
4. ⚠️ Implementa rate limiting (brute force protection)
5. ⚠️ Agrega refresh tokens (tokens de corta duración)
6. ⚠️ Implementa blacklist de tokens (logout real)
