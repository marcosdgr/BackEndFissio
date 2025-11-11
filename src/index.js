import express from "express";
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

// Importo rutas de cobros
import cobrosRoutes from "./Routes/Cobros/cobros.routes.js"
import db from "./Config/db.js";

// importo las rutas principales
import usuariosRoutes from "./Routes/Usuarios/usuarios.routes.js";
import localidadesRoutes from "./Routes/Usuarios/localidades.routes.js";
import usuariosRoutesNew from "./Routes/usuarios.routes.js";
import loginRoutes from "./Routes/Login/login.routes.js";
import pacientesRoutes from "./Routes/Pacientes/pacientes.routes.js";
import turnosRoutes from "./Routes/Turnos/turnos.routes.js";

// importo rutas de servicios
import serviciosRoutes from "./Routes/Servicios/servicios.routes.js";
import turnosServiciosRoutes from "./Routes/Servicios/turnos_servicios.routes.js";

//Importo rutas de tratamientos
import tratamientosRoutes from "./Routes/Tratamientos/tratamientos.routes.js";
import turnosTratamientosRoutes from "./Routes/Tratamientos/turno_tratamiento.routes.js";

// importo rutas de empleados
import empleadoRoutes from "./Routes/Empleados/empleados.routes.js";
import categoriaEmpleadoRoutes from "./Routes/Empleados/categoria_empleados.routes.js";

// import de rutas adicionales
import comentarioRoutes from "./Routes/Comentarios/comentarioRoutes.js";
import historiaClinicaRoutes from "./Routes/HistoriaClinica/historiaClinica.routes.js";
import salaRoutes from "./Routes/Salas/salaRoutes.js";
import metricaDiariaRoutes from "./Routes/MetricasDiarias/metricasDiariasRoutes.js";
import catFaqsRoutes from "./Routes/Faqs/catFaqsRoutes.js";
import faqsRoutes from "./Routes/Faqs/faqsRoutes.js";

// importo rutas de mensajería interna
import mensajesInternosRoutes from "./Routes/mensajes-internos.routes.js";

// importar servicio de recordatorios
import { iniciarCronRecordatorios } from "./Services/recordatorios.service.js";

import obrasSocialesRoutes from "./Routes/ObrasSociales/obrassociales.routes.js";
import planObraPacientes from "./Routes/ObrasSociales/obraSocialPaciente.routes.js";
import planObraSocial from "./Routes/ObrasSociales/planObra.routes.js";
import chatWebRoutes from "./BOT/routes/chatWeb.routes.js";


// Inicializo dotenv para leer las variables de entorno

dotenv.config();

// realizo conexion a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    process.exit(1);
  }
  console.log("Conexión exitosa a la base de datos MySQL");
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
app.use("/api/localidades/v1", localidadesRoutes);
app.use("/api/usuarios-new/v1", usuariosRoutesNew);
app.use("/api/auth/v1", loginRoutes);
app.use("/api/pacientes/v1", pacientesRoutes);
app.use("/api/turnos/v1", turnosRoutes);

// rutas de mensajería interna
app.use("/api/mensajes-internos/v1", mensajesInternosRoutes);

// rutas de servicios
app.use("/api/servicios/v1", serviciosRoutes);
app.use("/api/turnos-servicios/v1", turnosServiciosRoutes);

// rutas de tratamientos
app.use("/api/tratamientos/v1", tratamientosRoutes);
app.use("/api/turnos-tratamientos/v1", turnosTratamientosRoutes);

// rutas de empleados
app.use("/api/empleados/v1/categorias", categoriaEmpleadoRoutes);
app.use("/api/empleados/v1", empleadoRoutes);

// Rutas
app.use("/api/pagos/v1", pagosRoutes);
app.use("/api/catMedioPago/v1", catMedioPagoRoutes);
app.use("/api/catTipoPago/v1", catTipoPagoRoutes);
app.use("/api/horariosTrabajo/v1", horariosTrabajoRoutes); //horarios de trabajo
app.use("/api/empleadosHorarios/v1", empleadosHorariosRoutes); //empleados con horarios
app.use("/api/asistencias/v1", asistenciasRoutes); //asistencias
app.use("/api/cobros/v1", cobrosRoutes); //cobros




app.use("/api/obras-sociales/v1", obrasSocialesRoutes);
app.use("/api/plan-obra/v1", planObraSocial);
app.use("/api/plan-obra-paciente/v1", planObraPacientes);

app.use("/api/chat-web/v1", chatWebRoutes);


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} ✅`);

  // Iniciar sistema de recordatorios automáticos
  iniciarCronRecordatorios();
});
