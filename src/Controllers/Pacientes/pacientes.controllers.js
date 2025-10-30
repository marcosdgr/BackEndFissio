import db from "../../Config/db.js";

// traer todos los pacientes

export const traerPacientes = (req, res) => {
  const traerPacientesQuery = `
    SELECT p.idPaciente, p.DNI, p.NombrePaciente, p.ApellidoPaciente, p.FechaNacPaciente,
           p.TelefonoPaciente, p.DireccionPaciente, p.Sexo, l.NombreLocalidad, p.IsActive
    FROM pacientes p
    INNER JOIN localidades l ON p.idLocalidad = l.idLocalidad
  `;
  db.query(traerPacientesQuery, (err, results) => {
    if (err) {
      console.error("Error al traer los pacientes:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    return res.status(200).json(results);
  });
};

// actualizar datos del paciente

export const actualizarPaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const {
      NombrePaciente,
      ApellidoPaciente,
      DNI,
      FechaNacPaciente,
      TelefonoPaciente,
      DireccionPaciente,
      Sexo,
      idLocalidad,
    } = req.body;

    const actualizarPacienteQuery = `
      UPDATE pacientes 
      SET NombrePaciente = ?, ApellidoPaciente = ?, DNI = ?, FechaNacPaciente = ?, 
          TelefonoPaciente = ?, DireccionPaciente = ?, Sexo = ?, idLocalidad = ? 
      WHERE idPaciente = ?
    `;

    db.query(
      actualizarPacienteQuery,
      [
        NombrePaciente,
        ApellidoPaciente,
        DNI,
        FechaNacPaciente,
        TelefonoPaciente,
        DireccionPaciente,
        Sexo,
        idLocalidad,
        idPaciente,
      ],
      (error, results) => {
        if (error) {
          console.error("Error al actualizar paciente:", error);

          // Manejo SIMPLE de errores comunes para actualización
          if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("DNI") || error.sqlMessage?.includes("DNI")) {
              return res.status(400).json({
                message: "El DNI ya está registrado por otro paciente",
              });
            }
            if (error.message.includes("TelefonoPaciente") || 
                error.sqlMessage?.includes("TelefonoPaciente") ||
                error.message.includes("telefono") ||
                error.sqlMessage?.includes("telefono")) {
              return res.status(400).json({
                message: "El teléfono ya está registrado por otro paciente",
              });
            }
            return res.status(400).json({
              message: "Los datos ya están registrados por otro paciente",
            });
          }

          return res
            .status(500)
            .json({ message: "Error al actualizar paciente" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Paciente no encontrado" });
        }

        res.status(200).json({ message: "Paciente actualizado exitosamente" });
      }
    );
  } catch (error) {
    console.error("error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


// cambiar estado del paciente (activar/desactivar)
export const cambiarEstadoPaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const { IsActive } = req.body;

    // Validar que IsActive sea un valor válido
    if (IsActive !== 0 && IsActive !== 1) {
      return res.status(400).json({ 
        message: "IsActive debe ser 0 (inactivo) o 1 (activo)" 
      });
    }

    const cambiarEstadoQuery = `
      UPDATE pacientes 
      SET IsActive = ?
      WHERE idPaciente = ?
    `;

    db.query(cambiarEstadoQuery, [IsActive, idPaciente], (error, results) => {
      if (error) {
        console.error("Error al cambiar estado del paciente:", error);
        return res.status(500).json({ message: "Error al cambiar estado del paciente" });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const mensaje = IsActive === 1 ? "Paciente activado exitosamente" : "Paciente desactivado exitosamente";
      res.status(200).json({ message: mensaje });
    });
  } catch (error) {
    console.error("error del servidor: ", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};  