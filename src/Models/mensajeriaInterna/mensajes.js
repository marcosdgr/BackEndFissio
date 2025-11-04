import db from "../../Config/db.js";

const mensajesInternos = {
  crearNotificacion(idRemitente, mensaje, destinatarios, callback) {
    db.beginTransaction((err) => {
      if (err) {
        return callback(err);
      }

      // Insertar notificación base
      db.query(
        "INSERT INTO notificaciones (idRemitente, Mensaje) VALUES (?, ?)",
        [idRemitente, mensaje],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              callback(err);
            });
          }

          const idNotificacion = result.insertId;

          // Insertar destinatarios (empleados)
          let completados = 0;
          const total = destinatarios.length;

          destinatarios.forEach((idEmpleadoDest) => {
            db.query(
              "INSERT INTO notificaciones_destinatarios (idNotificacion, idEmpleadoDestinatario) VALUES (?, ?)",
              [idNotificacion, idEmpleadoDest],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    callback(err);
                  });
                }

                completados++;
                if (completados === total) {
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        callback(err);
                      });
                    }
                    callback(null, idNotificacion);
                  });
                }
              }
            );
          });
        }
      );
    });
  },

  obtenerConversacion(idUser1, idUser2, callback) {
    const sql = `
      SELECT 
        n.idNotificacion,
        n.Mensaje,
        n.FechaEnvio,
        n.Leido,
        n.idRemitente,
        u1.MailUsuario AS RemitenteEmail,
        e.NombreEmpleado AS NombreDestinatario,
        e.ApellidoEmpleado AS ApellidoDestinatario,
        nd.idEmpleadoDestinatario
      FROM notificaciones n
      JOIN notificaciones_destinatarios nd ON n.idNotificacion = nd.idNotificacion
      JOIN usuarios u1 ON n.idRemitente = u1.idUsuario
      JOIN empleados e ON nd.idEmpleadoDestinatario = e.idEmpleado
      WHERE 
        (n.idRemitente = ? AND nd.idEmpleadoDestinatario = ?) OR
        (n.idRemitente = ? AND nd.idEmpleadoDestinatario = ?)
      ORDER BY n.FechaEnvio ASC
    `;
    db.query(sql, [idUser1, idUser2, idUser2, idUser1], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  },

  marcarLeido(idNotificacion, idEmpleadoDest, callback) {
    const sql = `
      UPDATE notificaciones n
      JOIN notificaciones_destinatarios nd ON n.idNotificacion = nd.idNotificacion
      SET n.Leido = 1
      WHERE n.idNotificacion = ? AND nd.idEmpleadoDestinatario = ?
    `;
    db.query(sql, [idNotificacion, idEmpleadoDest], (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  },
};

export default mensajesInternos;