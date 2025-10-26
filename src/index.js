import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

import obrasSocialesRoutes from './Routes/obrassociales.routes.js';
import planObraRoutes from './Routes/planObra.routes.js';

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
app.use(cors());


// Confiruacion de puerto

const PORT = process.env.PORT || 3000;


// Middlewares
app.use(express.json());

// Rutas
app.use('/api/obras-sociales/v1', obrasSocialesRoutes);
app.use('/api/plan-obra/v1', planObraRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
});
