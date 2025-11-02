import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el proveedor que uses
  auth: {
    user: process.env.EMAIL_USER, // tu email
    pass: process.env.EMAIL_PASS  // contraseña de aplicación
  }
});

// Función para enviar email de confirmación de turno
export const enviarEmailConfirmacion = async (emailPaciente, datosTurno) => {
  const { idTurno, nombrePaciente, apellidoPaciente, fecha, horario, mensaje } = datosTurno;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">✅ Solicitud de Turno Recibida - Fissio</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #27ae60;">Hola ${nombrePaciente} ${apellidoPaciente},</h3>
        <p>Tu solicitud de turno ha sido recibida correctamente.</p>
      </div>
      
      <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h4 style="color: #34495e;">📋 Detalles de tu solicitud:</h4>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>🔢 Número de solicitud:</strong> #${idTurno}</li>
          <li><strong>📅 Fecha solicitada:</strong> ${fecha}</li>
          <li><strong>⏰ Horario solicitado:</strong> ${horario}</li>
          <li><strong>📌 Estado:</strong> Registrada</li>
        </ul>
      </div>
      
      <div style="background-color: #e8f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>� Próximos pasos:</strong></p>
        <p>Recibirás un recordatorio 24 horas antes de tu turno.</p>
        <p><strong>El día de tu turno:</strong> Preséntate en el horario solicitado. Nuestro personal asignará el kinesiólogo y sala disponibles en ese momento.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
        <p>--</p>
        <p><strong>Fissio - Centro de Kinesiología</strong></p>
        <p>Si tienes dudas, contáctanos al: [TELÉFONO] | [EMAIL]</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailPaciente,
    subject: `Solicitud de turno recibida - #${idTurno} | Fissio`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${emailPaciente}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error al enviar email a ${emailPaciente}:`, error);
    return { success: false, error: error.message };
  }
};

// Función para enviar recordatorio 24 horas antes del turno
export const enviarRecordatorio24h = async (emailPaciente, datosTurno) => {
  const { 
    idTurno, 
    nombrePaciente, 
    apellidoPaciente, 
    fecha, 
    horarioInicio, 
    horarioFin,
    kinesiologoNombre,
    kinesiologoApellido,
    sala 
  } = datosTurno;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f39c12;">🔔 Recordatorio de Turno - Fissio</h2>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404;">Hola ${nombrePaciente} ${apellidoPaciente},</h3>
        <p style="color: #856404;"><strong>Te recordamos que tienes un turno programado para mañana.</strong></p>
      </div>
      
      <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h4 style="color: #34495e;">📋 Detalles de tu turno solicitado:</h4>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>🔢 Turno #:</strong> ${idTurno}</li>
          <li><strong>📅 Fecha:</strong> ${fecha}</li>
          <li><strong>⏰ Horario solicitado:</strong> ${horarioInicio || 'Por confirmar'}</li>
          <li><strong>� Estado:</strong> Registrado - Preséntate mañana</li>
        </ul>
      </div>
      
      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
        <p><strong>📝 Recordatorios importantes:</strong></p>
        <ul>
          <li>✅ Llega 10 minutos antes de tu horario solicitado</li>
          <li>🆔 Trae tu DNI</li>
          <li>📋 Si tienes orden médica, no olvides traerla</li>
          <li>👕 Usa ropa cómoda para la sesión</li>
          <li>�‍⚕️ El kinesiólogo y sala se asignarán cuando llegues</li>
          <li>📞 Si no puedes asistir, avísanos con anticipación</li>
        </ul>
      </div>
      
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p><strong>⚠️ Importante:</strong> Si no puedes asistir, por favor comunícate con nosotros lo antes posible para reprogramar tu turno y permitir que otro paciente pueda usar ese horario.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
        <p>--</p>
        <p><strong>Fissio - Centro de Kinesiología</strong></p>
        <p>¡Te esperamos mañana! | Teléfono: [TELÉFONO] | Email: [EMAIL]</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailPaciente,
    subject: `🔔 Recordatorio: Turno mañana ${horarioInicio} - #${idTurno} | Fissio`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Recordatorio 24h enviado a ${emailPaciente}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${emailPaciente}:`, error);
    return { success: false, error: error.message };
  }
};

// Función para enviar email de confirmación final (cuando secretaria procesa)
export const enviarEmailConfirmacionFinal = async (emailPaciente, datosTurno) => {
  const { 
    idTurno, 
    nombrePaciente, 
    apellidoPaciente, 
    fecha, 
    horarioInicio, 
    horarioFin,
    kinesiologoNombre,
    kinesiologoApellido,
    sala 
  } = datosTurno;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">🎉 ¡Turno Confirmado! - Fissio</h2>
      
      <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <h3 style="color: #155724;">Hola ${nombrePaciente} ${apellidoPaciente},</h3>
        <p style="color: #155724;"><strong>¡Excelente noticia! Tu turno ha sido confirmado.</strong></p>
      </div>
      
      <div style="background-color: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h4 style="color: #34495e;">📋 Detalles de tu turno confirmado:</h4>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>🔢 Turno #:</strong> ${idTurno}</li>
          <li><strong>📅 Fecha:</strong> ${fecha}</li>
          <li><strong>⏰ Horario:</strong> ${horarioInicio} - ${horarioFin}</li>
          <li><strong>👨‍⚕️ Kinesiólogo:</strong> ${kinesiologoNombre} ${kinesiologoApellido}</li>
          <li><strong>🏥 Sala:</strong> ${sala}</li>
          <li><strong>✅ Estado:</strong> Confirmado</li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p><strong>⚠️ Importante:</strong></p>
        <ul>
          <li>Por favor, llega 10 minutos antes de tu turno</li>
          <li>Trae tu DNI y orden médica si la tienes</li>
          <li>Si necesitas cancelar o reprogramar, avísanos con 24hs de anticipación</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
        <p>--</p>
        <p><strong>Fissio - Centro de Kinesiología</strong></p>
        <p>¡Te esperamos! | Teléfono: [TELÉFONO] | Email: [EMAIL]</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailPaciente,
    subject: `✅ Turno Confirmado #${idTurno} - ${fecha} ${horarioInicio} | Fissio`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación final enviado a ${emailPaciente}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error al enviar email de confirmación final a ${emailPaciente}:`, error);
    return { success: false, error: error.message };
  }
};

export default transporter;