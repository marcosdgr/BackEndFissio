import db from '../../Config/db.js';


// Obtener todos los planes de obra social
export const obtenerPlanesObra = (req, res) => {
    try {
        const obtenerTodosLosPlanesObra = `
    SELECT 
      p.idPlanObra,
      p.idObraSocial,
      p.NombraPlan,
      p.DescripcionPlan,
      p.PorcentajeDescuentoPlan,
      p.EstadoPlan,
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
   
    const { idObraSocial, NombraPlan, DescripcionPlan, PorcentajeDescuentoPlan, EstadoPlan } = req.body;
    const obraId = idObraSocial || req.body.idObrasocial;

    const descripcionPlan = DescripcionPlan || null;
    const porcentajeDescuento = (PorcentajeDescuentoPlan !== undefined) ? PorcentajeDescuentoPlan : null;
    const estadoPlanFinal = EstadoPlan || 'Vigente';

    // Validar EstadoPlan
    const ALLOWED_ESTADO_PLAN = ['Vigente', 'No vigente'];
    if (EstadoPlan && !ALLOWED_ESTADO_PLAN.includes(EstadoPlan)) {
      return res.status(400).json({ error: `EstadoPlan inválido. Valores permitidos: ${ALLOWED_ESTADO_PLAN.join(', ')}` });
    }

    // Validaciones básicas
    if (!NombraPlan || !idObraSocial) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: NombraPlan o idObraSocial' });
    }

    // Verificar que la obra social existe 
    const verificarObraSocial = 'SELECT * FROM obraSociales WHERE idObraSocial = ?';
    db.query(verificarObraSocial, [idObraSocial], (err, obraResults) => {
      if (err) {
        console.error('Error al verificar obra social:', err);
        return res.status(500).json({ error: 'Error al verificar obra social' });
      }

      if (!obraResults || obraResults.length === 0) {
        return res.status(404).json({ error: 'Obra social no encontrada' });
      }

      // Crear el nuevo plan de obra social
      const crearNuevoPlanObra = 'INSERT INTO planObraSocial (idObraSocial, NombraPlan, DescripcionPlan, PorcentajeDescuentoPlan, EstadoPlan) VALUES (?, ?, ?, ?, ?)';
      db.query(crearNuevoPlanObra, [obraId, NombraPlan, descripcionPlan, porcentajeDescuento, estadoPlanFinal], (Error, Result) => {
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
    
    const { idObraSocial: idObraBody, NombraPlan: NP, DescripcionPlan: DP, PorcentajeDescuentoPlan: PDP, EstadoPlan: EP } = req.body;
    const obraIdUpdate = idObraBody || req.body.idObrasocial;

    const descripcionPlanUp = DP || null;
    const porcentajeDescuentoUp = (PDP !== undefined) ? PDP : null;
    const estadoPlanUp = EP || undefined;

    const ALLOWED_ESTADO_PLAN = ['Vigente', 'No vigente'];
    if (estadoPlanUp && !ALLOWED_ESTADO_PLAN.includes(estadoPlanUp)) {
      return res.status(400).json({ error: `EstadoPlan inválido. Valores permitidos: ${ALLOWED_ESTADO_PLAN.join(', ')}` });
    }

    const actualizarPlanObraQuery = `
      UPDATE planObraSocial
      SET idObraSocial = ?, NombraPlan = ?, DescripcionPlan = ?, PorcentajeDescuentoPlan = ?` + (estadoPlanUp ? `, EstadoPlan = ?` : ``) + `
      WHERE idPlanObra = ?
    `;

    const params = estadoPlanUp ? [obraIdUpdate, NP, descripcionPlanUp, porcentajeDescuentoUp, estadoPlanUp, idPlanObra] : [obraIdUpdate, NP, descripcionPlanUp, porcentajeDescuentoUp, idPlanObra];

    db.query(actualizarPlanObraQuery, params, (err, results) => {
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
export const cambiarEstadoPlan = (req, res) => {
  try {
    const { idPlanObra } = req.params;
    // Validar idPlanObra
    const id = Number(idPlanObra);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'idPlanObra inválido' });
    }

    // Consultar estado actual del plan
    const verificarEstadoQuery = `SELECT EstadoPlan FROM planObraSocial WHERE idPlanObra = ?`;
    db.query(verificarEstadoQuery, [id], (err, results) => {
      if (err) {
        console.error('Error al verificar estado del plan de obra:', err);
        return res.status(500).json({ message: 'Error al verificar estado del plan de obra' });
      }

      if (!results || results.length === 0 || !results[0]) {
        return res.status(404).json({ message: 'Plan de obra no encontrado' });
      }

      const currentRaw = results[0].EstadoPlan;
      const current = typeof currentRaw === 'string' ? currentRaw.trim() : currentRaw;

      // Si se envía explícitamente, sólo aceptamos exactamente 'Vigente' o 'No vigente'
      const targetRaw = req.body && req.body.EstadoPlan;
      let target;

      if (targetRaw === undefined || targetRaw === null) {
        // toggle based on current value
        if (String(current).trim() === 'Vigente') target = 'No vigente';
        else target = 'Vigente';
      } else {
        // exigimos valor exacto 
        if (typeof targetRaw === 'string' && (targetRaw === 'Vigente' || targetRaw === 'No vigente')) {
          target = targetRaw;
        } else {
          return res.status(400).json({ message: 'EstadoPlan inválido. Debe ser exactamente "Vigente" o "No vigente" si se especifica.' });
        }
      }

      // Si no hay cambio, responder idempotente
      if (String(current).trim().toLowerCase() === String(target).trim().toLowerCase()) {
        return res.status(200).json({ message: `El plan ya se encuentra ${target}` });
      }

      // Actualizamos solo EstadoPlan
      const cambiarEstadoQuery = `UPDATE planObraSocial SET EstadoPlan = ? WHERE idPlanObra = ?`;
      db.query(cambiarEstadoQuery, [target, id], (error, updateResults) => {
        if (error) {
          console.error('Error al cambiar EstadoPlan del plan de obra:', error);
          return res.status(500).json({ message: 'Error al cambiar EstadoPlan del plan de obra' });
        }

        if (!updateResults || updateResults.affectedRows === 0) {
          return res.status(404).json({ message: 'Plan de obra no encontrado' });
        }

        return res.status(200).json({ message: `EstadoPlan actualizado a ${target}`, EstadoPlan: target });
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
