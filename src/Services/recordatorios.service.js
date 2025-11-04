import cron from 'node-cron';
import db from '../Config/db.js';
import { enviarRecordatorio24h } from '../Config/mailer.js';

// Función para obtener turnos que necesitan recordatorio (24h antes)
const obtenerTurnosParaRecordatorio = () => {
  return new Promise((resolve, reject) => {
    // Buscar turnos confirmados para mañana que no hayan sido recordados
    const query = `
      SELECT 
        t.idTurno,
        t.FechaRequeridaTurno,
        t.HorarioRequeridoTurno,
        t.HorarioInicioTurno,
        t.HorarioFinTurno,
        p.NombrePaciente,
        p.ApellidoPaciente,
        e.NombreEmpleado,
        e.ApellidoEmpleado,
        s.NombreSala,
        u.MailUsuario
      FROM turnos t
      INNER JOIN pacientes p ON t.idPaciente = p.idPaciente
      INNER JOIN usuarios u ON p.idUsuario = u.idUsuario
      LEFT JOIN empleados e ON t.idEmpleado = e.idEmpleado
      LEFT JOIN salas s ON t.idSala = s.idSala
      WHERE t.EstadoTurno = 'Solicitado'
        AND DATE(t.FechaRequeridaTurno) = DATE(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
        AND t.idTurno NOT IN (
          SELECT r.idTurno 
          FROM recordatorios r 
          WHERE r.TipoNotificacion = 'Recordatorio' 
            AND r.Enviado = 1
            AND DATE(r.FechaEnvio) = CURDATE()
        )
    `;

    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Función para marcar recordatorio como enviado en la base de datos
const marcarRecordatorioEnviado = (idTurno, mensaje, exito = true) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO recordatorios (
        TipoNotificacion, 
        Mensaje, 
        FechaEnvio, 
        Enviado, 
        idTurno
      ) VALUES ('Recordatorio', ?, NOW(), ?, ?)
    `;

    db.query(insertQuery, [mensaje, exito ? 1 : 0, idTurno], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Función principal para procesar recordatorios
const procesarRecordatorios24h = async () => {
  try {
    console.log('🔔 Iniciando proceso de recordatorios 24h...');
    
    const turnos = await obtenerTurnosParaRecordatorio();
    
    if (turnos.length === 0) {
      console.log('ℹ️ No hay turnos para recordar hoy.');
      return;
    }

    console.log(`📅 Encontrados ${turnos.length} turnos para recordar.`);

    for (const turno of turnos) {
      try {
        const datosTurno = {
          idTurno: turno.idTurno,
          nombrePaciente: turno.NombrePaciente,
          apellidoPaciente: turno.ApellidoPaciente,
          FechaRequeridaTurno: turno.FechaRequeridaTurno,
          HorarioRequeridoTurno: turno.HorarioRequeridoTurno,
          kinesiologoNombre: null, // No asignado aún en estado 'Solicitado'
          kinesiologoApellido: null,
          sala: null
        };

        // Enviar recordatorio por email
        const resultado = await enviarRecordatorio24h(turno.MailUsuario, datosTurno);
        
        // Marcar como enviado en la base de datos
        const mensaje = resultado.success 
          ? `Recordatorio enviado exitosamente a ${turno.MailUsuario}`
          : `Error al enviar recordatorio: ${resultado.error}`;
          
        await marcarRecordatorioEnviado(turno.idTurno, mensaje, resultado.success);
        
        if (resultado.success) {
          console.log(`✅ Recordatorio enviado: Turno #${turno.idTurno} - ${turno.NombrePaciente} ${turno.ApellidoPaciente}`);
        } else {
          console.error(`❌ Error en turno #${turno.idTurno}:`, resultado.error);
        }
        
        // Pausa entre emails para evitar límites de rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error procesando turno #${turno.idTurno}:`, error);
        
        // Marcar como error en la base de datos
        try {
          await marcarRecordatorioEnviado(
            turno.idTurno, 
            `Error al procesar recordatorio: ${error.message}`, 
            false
          );
        } catch (dbError) {
          console.error('Error guardando fallo en BD:', dbError);
        }
      }
    }

    console.log('🎉 Proceso de recordatorios completado.');
    
  } catch (error) {
    console.error('❌ Error en proceso de recordatorios:', error);
  }
};

// Configurar cron job - Se ejecuta todos los días a las 10:00 AM
// Formato: segundos minutos horas día_mes mes día_semana
const iniciarCronRecordatorios = () => {
  // Ejecutar todos los días a las 10:00 AM
  cron.schedule('0 10 * * *', () => {
    console.log('⏰ Ejecutando tarea programada de recordatorios (10:00 AM)');
    procesarRecordatorios24h();
  }, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires" // Ajusta según tu zona horaria
  });

  console.log('⚙️ Cron job de recordatorios configurado - Se ejecutará todos los días a las 10:00 AM');
};

// También permitir ejecución manual para testing
const ejecutarRecordatoriosManual = async () => {
  console.log('🔄 Ejecutando recordatorios manualmente...');
  await procesarRecordatorios24h();
};

export { iniciarCronRecordatorios, ejecutarRecordatoriosManual };