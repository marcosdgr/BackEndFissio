import express from "express";
import db from "./Config/db.js";
import dotenv from "dotenv";
import cors from "cors";


// importo ruta de pago 
import pagosRoutes from "./Routes/Pagos/pagos.routes.js";

// Importo rutas de categorias de medio de pago
import catMedioPagoRoutes from "./Routes/Pagos/catMedioPago.routes.js";

// Importo rutas de categorias de tipos de pago
import catTipoPagoRoutes from "./Routes/Pagos/catTipoPago.routes.js"

// importo ruta de horarios de trabajo
import horariosTrabajoRoutes from "./Routes/HorarioTrabajo/horariosTrabajo.routes.js";

//importo ruta de empleados horarios
import empleadosHorariosRoutes from "./Routes/EmpleadosHorarios/empleadoshorarios.routes.js"

// Importo rutas de asistencias
import asistenciasRoutes from "./Routes/Asistencias/asistencias.routes.js"

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
app.use("/api/catMedioPago/v1", catMedioPagoRoutes); //categorias de medio de pago
app.use("/api/catTipoPago/v1", catTipoPagoRoutes); // categorias de tipo de pago
app.use("/api/horariosTrabajo/v1", horariosTrabajoRoutes); //horarios de trabajo
app.use("/api/empleadosHorarios/v1", empleadosHorariosRoutes); //empleados con horarios
app.use("/api/asistencias/v1", asistenciasRoutes); //asistencias




// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
});
