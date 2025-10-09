import express from "express";
import db from "./Config/db.js";
import dotenv from "dotenv";
import cors from "cors";

// importo las rutas
import usuariosRoutes from "./Routes/usuarios.routes.js";
import loginRoutes from "./Routes/login.routes.js";

// Inicializo dotenv para leer las variables de entorno
dotenv.config();

// creao la conexion a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error de conexión: ❌", err);
    return;
  }
  console.log("✅ Conexión a MySQL exitosa ");
});


// Inicializo express
const app = express();

// Aqui se va a configurar CORS



// Confiruacion de puerto

const PORT = process.env.PORT || 3000;


// Middlewares
app.use(express.json());

// Rutas
// rutas register
app.use("/api/usuarios/v1", usuariosRoutes);

// rutas login
app.use("/api/login/v1", loginRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
});
