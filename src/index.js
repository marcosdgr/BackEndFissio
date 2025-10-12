import express from "express";
import db from "./Config/db.js";
import dotenv from "dotenv";
import cors from "cors";


// importo ruta de pago 
import pagosRoutes from "./Routes/pagos.routes.js";
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
app.use("/api/pagos/v1", pagosRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
});
