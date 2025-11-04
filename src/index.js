import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// importo la base de datos
import db from "./Config/db.js";

// importo las rutas
import usuariosRoutes from "./Routes/Usuarios/usuarios.routes.js";
import loginRoutes from "./Routes/Login/login.routes.js";
import pacientesRoutes from "./Routes/Pacientes/pacientes.routes.js";
import turnosRoutes from "./Routes/Turnos/turnos.routes.js";
// importo rutas de servicios
import serviciosRoutes from "./Routes/Servicios/servicios.routes.js";
import turnosServiciosRoutes from "./Routes/Servicios/turnos_servicios.routes.js";

// importar servicio de recordatorios
import { iniciarCronRecordatorios } from "./Services/recordatorios.service.js";

// import de rutas adicionales
import comentarioRoutes from "./Routes/comentarioRoutes.js";
import historiaClinicaRoutes from "./Routes/historiaClinica.routes.js";
import salaRoutes from "./Routes/salaRoutes.js";
import metricaDiariaRoutes from "./Routes/metricasDiariasRoutes.js";
import catFaqsRoutes from "./Routes/catFaqsRoutes.js";
import faqsRoutes from "./Routes/faqsRoutes.js";

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

// rutas register
app.use("/api/usuarios/v1", usuariosRoutes);

// rutas login
app.use("/api/login/v1", loginRoutes);

// rutas pacientes
app.use("/api/pacientes/v1", pacientesRoutes);

// rutas para turnos

app.use("/api/turnos/v1", turnosRoutes);

app.use("/api/servicios/v1", serviciosRoutes);
app.use("/api/turnos-servicios/v1", turnosServiciosRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);

  // Iniciar sistema de recordatorios automáticos
  iniciarCronRecordatorios();
});
