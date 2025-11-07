import db from '../../Config/db.js';


// Obtener todos los planes de obra social
export const obtenerPlanesObra = (req, res) => {
    try {
        const obtenerTodosLosPlanesObra = `
    SELECT 
      p.idPlanObra,
      p.NombraPlan,
      p.DescripcionPlan,
      p.PorcentajeDescuentoPlan,
      o.NombreObraSocial,
      p.IsActive
    FROM planObraSocial p
    INNER JOIN obraSociales o ON p.idObraSocial = o.idObraSocial
  `;
        db.query(obtenerTodosLosPlanesObra, (err, results) => {
            if (err) {
                console.error('Error al obtener los planes de obra social:', err);
                return res.status(500).json({ error: 'Error al obtener los planes de obra social' });
            }
            return res.json(results);
        });
    } catch (error) {
        console.error('Error en obtenerPlanesObra:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};
// Obtener un plan de obra social por ID
export const obtenerPlanObraPorId = (req, res) => {
    try {
        const { idPlanObra } = req.params;
        const obtenerPlanObra = 'SELECT * FROM planObraSocial WHERE idPlanObra = ?';
        db.query(obtenerPlanObra, [idPlanObra], (err, results) => {
            if (err) {
                console.error('Error al obtener el plan de obra social por ID:', err);
                return res.status(500).json({ error: 'Error al obtener el plan de obra social por ID' });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Plan de obra social no encontrado' });
            }
            return res.json(results[0]);
        });
    } catch (error) {
        console.error('Error en obtenerPlanObraPorId:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};

// Crear un nuevo plan de obra social
export const crearPlanObra = (req, res) => {
  try {
    // Campos esperados en body: NombraPlan, DescripcionPlan (sin acento), PorcentajeDescuentoPlan (opcional), idObraSocial
    const { NombraPlan, DescripcionPlan, PorcentajeDescuentoPlan } = req.body;
    const idObraSocial = req.body.idObraSocial || req.body.idObrasocial;

    const descripcionPlan = DescripcionPlan || null;
    const porcentajeDescuento = (PorcentajeDescuentoPlan !== undefined) ? PorcentajeDescuentoPlan : null;

    // Validaciones básicas
    if (!NombraPlan || !idObraSocial) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: NombraPlan o idObraSocial' });
    }

    // Verificar que la obra social existe (callback)
    const verificarObraSocial = 'SELECT * FROM obraSociales WHERE idObraSocial = ?';
    db.query(verificarObraSocial, [idObraSocial], (err, obraResults) => {
      if (err) {
        console.error('Error al verificar obra social:', err);
        return res.status(500).json({ error: 'Error al verificar obra social' });
      }

      if (!obraResults || obraResults.length === 0) {
        return res.status(404).json({ error: 'Obra social no encontrada' });
      }

      // Crear el nuevo plan de obra social (callback)
      const crearNuevoPlanObra = 'INSERT INTO planObraSocial (NombraPlan, DescripcionPlan, PorcentajeDescuentoPlan, idObraSocial) VALUES (?, ?, ?, ?)';
      db.query(crearNuevoPlanObra, [NombraPlan, descripcionPlan, porcentajeDescuento, idObraSocial], (Error, Result) => {
        if (Error) {
          console.error('Error al crear el nuevo plan de obra social:', Error);
          return res.status(500).json({ error: 'Error al crear el nuevo plan de obra social' });
        }

        return res.status(201).json({ message: 'Nuevo plan de obra social creado exitosamente', id: Result.insertId });
      });
    });
  } catch (error) {
    console.error('Error en crearPlanObra:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

// Actualizar un plan de obra social existente
export const actualizarPlanObra = (req, res) => {
  try {
    const { idPlanObra } = req.params;
    // Campos esperados en body: NombraPlan, DescripcionPlan (sin acento), PorcentajeDescuentoPlan (opcional), idObraSocial
    const { NombraPlan, DescripcionPlan, PorcentajeDescuentoPlan } = req.body;
    const idObraSocial = req.body.idObraSocial || req.body.idObrasocial;

    const descripcionPlan = DescripcionPlan || null;
    const porcentajeDescuento = (PorcentajeDescuentoPlan !== undefined) ? PorcentajeDescuentoPlan : null;

    const actualizarPlanObraQuery = `
      UPDATE planObraSocial
      SET NombraPlan = ?, DescripcionPlan = ?, PorcentajeDescuentoPlan = ?, idObraSocial = ?
      WHERE idPlanObra = ?
    `;

    db.query(actualizarPlanObraQuery, [NombraPlan, descripcionPlan, porcentajeDescuento, idObraSocial, idPlanObra], (err, results) => {
      if (err) {
        console.error('Error al actualizar el plan de obra social:', err);
        return res.status(500).json({ error: 'Error al actualizar el plan de obra social' });
      }
      return res.status(200).json({ message: 'Plan de obra social actualizado exitosamente' });
    });
  } catch (error) {
    console.error('Error en actualizarPlanObra:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

// Cambiar estado del plan de obra (activar/desactivar)
export const cambiarEstadoPlan = async (req, res) => {
  try {
    const { idPlanObra } = req.params;
    const { IsActive } = req.body;
    // Validar idPlanObra
    const id = Number(idPlanObra);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'idPlanObra inválido' });
    }

    // Validar que IsActive sea un valor válido (acepta '0'/'1' o 0/1)
    if (IsActive === undefined || IsActive === null) {
      return res.status(400).json({ message: 'Falta el campo IsActive en el body' });
    }
    const isActiveCoerced = (typeof IsActive === 'string') ? (IsActive === '1' ? 1 : (IsActive === '0' ? 0 : NaN)) : Number(IsActive);
    if (isNaN(isActiveCoerced) || (isActiveCoerced !== 0 && isActiveCoerced !== 1)) {
      return res.status(400).json({ message: 'IsActive debe ser 0 (inactivo) o 1 (activo)' });
    }

    // Primero verificar el estado actual del empleado
    const verificarEstadoQuery = `
      SELECT IsActive 
      FROM planObraSocial
      WHERE idPlanObra = ?
    `;

    db.query(verificarEstadoQuery, [id], (err, results) => {
      if (err) {
        console.error('Error al verificar estado del plan de obra:', err);
        return res.status(500).json({ message: 'Error al verificar estado del plan de obra' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Plan de obra no encontrado' });
      }

      const estadoActual = results[0].IsActive;

      // Validar que el estado nuevo sea diferente al actual
      if (estadoActual === isActiveCoerced) {
        const estadoTexto = isActiveCoerced === 1 ? 'activo' : 'inactivo';
        return res.status(400).json({ message: `El plan de obra ya se encuentra ${estadoTexto}` });
      }

      // Si se intenta desactivar, verificar que no existan pacientes con ese plan activo
      if (isActiveCoerced === 0) {
        const verificarReferencias = `SELECT COUNT(*) as cnt FROM obraSocial_Paciente WHERE idPlanObra = ? AND EstadoPlan = 'activo' AND IsActive = 1`;
        db.query(verificarReferencias, [id], (refErr, refResults) => {
          if (refErr) {
            console.error('Error al verificar referencias en obraSocial_Paciente:', refErr);
            return res.status(500).json({ message: 'Error al verificar referencias del plan' });
          }

          const count = refResults && refResults[0] ? refResults[0].cnt : 0;
          if (count > 0) {
            return res.status(409).json({ message: `No se puede desactivar el plan: existen ${count} pacientes con este plan activo` });
          }

          // Si no hay referencias activas, proceder con la desactivación
          const cambiarEstadoQuery = `
            UPDATE planObraSocial
            SET IsActive = ?
            WHERE idPlanObra = ?
          `;

          db.query(cambiarEstadoQuery, [isActiveCoerced, id], (error, updateResults) => {
            if (error) {
              console.error('Error al cambiar estado del plan de obra:', error);
              return res.status(500).json({ message: 'Error al cambiar estado del plan de obra' });
            }

            if (!updateResults || updateResults.affectedRows === 0) {
              return res.status(404).json({ message: 'Plan de obra no encontrado' });
            }

            const mensaje = isActiveCoerced === 1 ? 'Plan de obra activado exitosamente' : 'Plan de obra desactivado exitosamente';
            return res.status(200).json({ message: mensaje });
          });
        });
        return; // ya respondimos o seguimos en callback
      }

      // Si se llega aquí, significa que isActiveCoerced === 1 (activación)
      const cambiarEstadoQuery = `
        UPDATE planObraSocial
        SET IsActive = ?
        WHERE idPlanObra = ?
      `;

      db.query(cambiarEstadoQuery, [isActiveCoerced, id], (error, updateResults) => {
        if (error) {
          console.error('Error al cambiar estado del plan de obra:', error);
          return res.status(500).json({ message: 'Error al cambiar estado del plan de obra' });
        }

        if (!updateResults || updateResults.affectedRows === 0) {
          return res.status(404).json({ message: 'Plan de obra no encontrado' });
        }

        const mensaje = isActiveCoerced === 1 ? 'Plan de obra activado exitosamente' : 'Plan de obra desactivado exitosamente';
        return res.status(200).json({ message: mensaje });
      });
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


//obtener planes de obra social activos
export const obtenerPlanesActivos = async (req, res) => {
  try {
    const query = 'SELECT * FROM planObraSocial WHERE IsActive = 1';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener planes de obra social activos:', err);
        return res.status(500).json({ message: 'Error al obtener planes de obra social activos' });
      }

      return res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//obtener planes de obra social inactivos
export const obtenerPlanesInactivos = async (req, res) => {
    try {
        const query = 'SELECT * FROM planObraSocial WHERE IsActive = 0';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener planes de obra social inactivos:', err);
                return res.status(500).json({ message: 'Error al obtener planes de obra social inactivos' });
            }

            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
