import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// importo la base de datos
import db from "./Config/db.js";

// importo las rutas principales
import usuariosRoutes from "./Routes/Usuarios/usuarios.routes.js";
import loginRoutes from "./Routes/Login/login.routes.js";
import pacientesRoutes from "./Routes/Pacientes/pacientes.routes.js";
import turnosRoutes from "./Routes/Turnos/turnos.routes.js";

// importo rutas de servicios
import serviciosRoutes from "./Routes/Servicios/servicios.routes.js";
import turnosServiciosRoutes from "./Routes/Servicios/turnos_servicios.routes.js";

// importo rutas de empleados
import empleadoRoutes from "./Routes/Empleados/empleados.routes.js";
import categoriaEmpleadoRoutes from "./Routes/Empleados/categoria_empleados.routes.js";

// import de rutas adicionales
import comentarioRoutes from "./Routes/comentarioRoutes.js";
import historiaClinicaRoutes from "./Routes/historiaClinica.routes.js";
import salaRoutes from "./Routes/salaRoutes.js";
import metricaDiariaRoutes from "./Routes/metricasDiariasRoutes.js";
import catFaqsRoutes from "./Routes/catFaqsRoutes.js";
import faqsRoutes from "./Routes/faqsRoutes.js";

// importar servicio de recordatorios
import { iniciarCronRecordatorios } from "./Services/recordatorios.service.js";

// Inicializo dotenv para leer las variables de entorno

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
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// configuracion del puerto
const PORT = process.env.PORT || 3000;

// middlewares

app.use(express.json());

// rutas
// comentarios
app.use("/api/comentarios/v1", comentarioRoutes);
// historias clinicas
app.use("/api/historiasClinicas/v1", historiaClinicaRoutes);
// salas
app.use("/api/salas/v1", salaRoutes);
// metricas diarias
app.use("/api/metricas/v1", metricaDiariaRoutes);
//categorias FAQ
app.use("/api/cat-faqs/v1", catFaqsRoutes);
// FAQs
app.use("/api/faqs/v1", faqsRoutes);

// rutas principales
app.use("/api/usuarios/v1", usuariosRoutes);
app.use("/api/login/v1", loginRoutes);
app.use("/api/pacientes/v1", pacientesRoutes);
app.use("/api/turnos/v1", turnosRoutes);

// rutas de servicios
app.use("/api/servicios/v1", serviciosRoutes);
app.use("/api/turnos-servicios/v1", turnosServiciosRoutes);

// rutas de empleados
app.use("/api/empleados/v1/categorias", categoriaEmpleadoRoutes);
app.use("/api/empleados/v1", empleadoRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);

  // Iniciar sistema de recordatorios automáticos
  iniciarCronRecordatorios();
});
