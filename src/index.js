import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import cors from "cors";
// import de rutas
import comentarioRoutes from "./Routes/comentarioRoutes.js";

// inicio dotenv para llamar las variables de entorno desde el archivo .env
dotenv.config();

// creao la conexion a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error de conexion a la base de datos: ", err);
    return;
  }
  console.log("Conexion a la DB exitosa");
});

// inicializo express
const app = express();

//configuro cors (permitir requests desde cualquier origen, ya que no hay frontend aún)
app.use(cors({
  origin: '*',
  credentials: true
}));

// configuracion del puerto
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());

// rutas
    // comentarios
app.use("/api/comentarios/v1", comentarioRoutes);

// inicializo el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});