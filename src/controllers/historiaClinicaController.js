import db from "../config/db.js";

// crear historia clínica
export const crearHistoriaClinica = async (req, res) => {
  try {
    const {
      FechaInicio,
      Diagnostico,
      Observaciones,
      FechaActualizacion,
      CreadoPor,
      ActualizadoPor,
      idPaciente
    } = req.body;

    // Validación básica
    if (!FechaInicio || !FechaActualizacion || !CreadoPor || !ActualizadoPor || !idPaciente) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const CrearHistoriaClinicaQuery = `
      INSERT INTO historiasClinicas (
        FechaInicio, Diagnostico, Observaciones, FechaActualizacion,
        CreadoPor, ActualizadoPor, IsActive, idPaciente
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `;

    db.query(
      CrearHistoriaClinicaQuery,
      [FechaInicio, Diagnostico, Observaciones, FechaActualizacion, CreadoPor, ActualizadoPor, idPaciente],
      (err, result) => {
        if (err) {
          console.error("Error al crear historia clínica: ", err);
          if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: "Paciente o empleado no encontrado" });
          }
          return res.status(500).json({ mensaje: "Error al crear historia clínica" });
        }

        // Obtener la historia clínica creada con nombres
        const ObtenerHistoriaCreadaQuery = `
          SELECT 
            hc.*,
            p.NombrePaciente, p.ApellidoPaciente,
            ec.NombreEmpleado AS CreadoPorNombre, ec.ApellidoEmpleado AS CreadoPorApellido,
            ea.NombreEmpleado AS ActualizadoPorNombre, ea.ApellidoEmpleado AS ActualizadoPorApellido
          FROM historiasClinicas hc
          JOIN pacientes p ON hc.idPaciente = p.idPaciente
          JOIN empleados ec ON hc.CreadoPor = ec.idEmpleado
          JOIN empleados ea ON hc.ActualizadoPor = ea.idEmpleado
          WHERE hc.idHistoriaClinica = ?
        `;

        db.query(ObtenerHistoriaCreadaQuery, [result.insertId], (errSelect, historia) => {
          if (errSelect) {
            console.error("Error al obtener historia clínica: ", errSelect);
            return res.status(500).json({ mensaje: "Error al obtener historia clínica" });
          }
          res.status(201).json({
            mensaje: "Historia clínica creada exitosamente",
            data: historia[0]
          });
        });
      }
    );
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// traer todas las historias clínicas activas
export const traerHistoriasClinicasActivas = async (req, res) => {
  try {
    const ListarHistoriasActivasQuery = `
      SELECT 
        hc.*,
        p.NombrePaciente, p.ApellidoPaciente,
        ec.NombreEmpleado AS CreadoPorNombre, ec.ApellidoEmpleado AS CreadoPorApellido,
        ea.NombreEmpleado AS ActualizadoPorNombre, ea.ApellidoEmpleado AS ActualizadoPorApellido
      FROM historiasClinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente
      JOIN empleados ec ON hc.CreadoPor = ec.idEmpleado
      JOIN empleados ea ON hc.ActualizadoPor = ea.idEmpleado
      WHERE hc.IsActive = 1
      ORDER BY hc.FechaActualizacion DESC
    `;

    db.query(ListarHistoriasActivasQuery, (err, historias) => {
      if (err) {
        console.error("Error al traer historias clínicas: ", err);
        return res.status(500).json({ mensaje: "Error al traer historias clínicas" });
      }
      res.status(200).json(historias);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// traer por id 
export const traerHistoriaClinicaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ObtenerHistoriaPorIdQuery = `
      SELECT 
        hc.*,
        p.NombrePaciente, p.ApellidoPaciente,
        ec.NombreEmpleado AS CreadoPorNombre, ec.ApellidoEmpleado AS CreadoPorApellido,
        ea.NombreEmpleado AS ActualizadoPorNombre, ea.ApellidoEmpleado AS ActualizadoPorApellido
      FROM historiasClinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente
      JOIN empleados ec ON hc.CreadoPor = ec.idEmpleado
      JOIN empleados ea ON hc.ActualizadoPor = ea.idEmpleado
      WHERE hc.idHistoriaClinica = ? AND hc.IsActive = 1
    `;

    db.query(ObtenerHistoriaPorIdQuery, [id], (err, historias) => {
      if (err) {
        console.error("Error al traer historia por ID: ", err);
        return res.status(500).json({ mensaje: "Error al traer historia por ID" });
      }
      if (!historias || historias.length === 0) {
        return res.status(404).json({ mensaje: "Historia clínica no encontrada" });
      }
      res.status(200).json(historias[0]);
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

//actualizar
export const actualizarHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Diagnostico,
      Observaciones,
      FechaActualizacion,
      ActualizadoPor
    } = req.body;

    if (!FechaActualizacion || !ActualizadoPor) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios para actualizar" });
    }

    const ActualizarHistoriaClinicaQuery = `
      UPDATE historiasClinicas 
      SET Diagnostico = ?, Observaciones = ?, FechaActualizacion = ?, ActualizadoPor = ?
      WHERE idHistoriaClinica = ? AND IsActive = 1
    `;

    db.query(
      ActualizarHistoriaClinicaQuery,
      [Diagnostico, Observaciones, FechaActualizacion, ActualizadoPor, id],
      (err, result) => {
        if (err) {
          console.error("Error al actualizar historia clínica: ", err);
          if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: "Empleado no encontrado" });
          }
          return res.status(500).json({ mensaje: "Error al actualizar historia área" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ mensaje: "Historia clínica no encontrada" });
        }

        // Devolver actualizada
        const ObtenerHistoriaActualizadaQuery = `
          SELECT 
            hc.*,
            p.NombrePaciente, p.ApellidoPaciente,
            ec.NombreEmpleado AS CreadoPorNombre, ec.ApellidoEmpleado AS CreadoPorApellido,
            ea.NombreEmpleado AS ActualizadoPorNombre, ea.ApellidoEmpleado AS ActualizadoPorApellido
          FROM historiasClinicas hc
          JOIN pacientes p ON hc.idPaciente = p.idPaciente
          JOIN empleados ec ON hc.CreadoPor = ec.idEmpleado
          JOIN empleados ea ON hc.ActualizadoPor = ea.idEmpleado
          WHERE hc.idHistoriaClinica = ?
        `;

        db.query(ObtenerHistoriaActualizadaQuery, [id], (errSelect, historia) => {
          if (errSelect) {
            console.error("Error al obtener historia actualizada: ", errSelect);
            return res.status(500).json({ mensaje: "Error al obtener historia actualizada" });
          }
          res.status(200).json({
            mensaje: "Historia clínica actualizada",
            data: historia[0]
          });
        });
      }
    );
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

export const borradoLogicoHistoriaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const EliminarLogicoHistoriaClinicaQuery = `UPDATE historiasClinicas SET IsActive = 0 WHERE idHistoriaClinica = ?`;

    db.query(EliminarLogicoHistoriaClinicaQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar historia clínica: ", err);
        return res.status(500).json({ mensaje: "Error al eliminar historia clínica" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Historia clínica no encontrada" });
      }

      res.status(200).json({ mensaje: "Historia clínica eliminada lógicamente" });
    });
  } catch (error) {
    console.error("Error del servidor: ", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};