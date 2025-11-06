import db from '../../Config/db.js';

export const obtenerPlanesPaciente = async (req, res) => {
    try {
        const obtenerTodosLosPlanesObra = 'SELECT * FROM obraSocial_Paciente';
        db.query(obtenerTodosLosPlanesObra, (err, results) => {
            if (err) {
                console.error('Error al obtener los planes de obra:', err);
                res.status(500).json({ error: 'Error al obtener los planes de obra' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const obtenerPlanesPacientePorId = async (req, res) => {
    try {
        // Ahora buscamos por idPlanObra (FK a planObraSocial)
        const { idPlanObra } = req.params;
        const obtenerPlanObra = 'SELECT * FROM obraSocial_Paciente WHERE idPlanObra = ?';
        db.query(obtenerPlanObra, [idPlanObra], (error, results) => {
            if (error) {
                console.error('Error al obtener los planes por idPlanObra:', error);
                return res.status(500).json({ error: 'Error al obtener los planes por idPlanObra' });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'No se encontraron planes para ese idPlanObra' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};

export const crearPlanPaciente = async (req, res) => {
    try {
        // Ahora esperamos idPlanObra (FK a planObraSocial) en lugar de PlanObraSocial
        const { idPaciente, idPlanObra, NumeroAfiliado, EstadoPlan } = req.body;

        // 1. Validar campos obligatorios
        if (!idPaciente || !idPlanObra || !NumeroAfiliado) {
            return res.status(400).json({ error: 'El paciente, idPlanObra y número de afiliado son obligatorios' });
        }

        // 2. Validar que NumeroAfiliado no esté vacío y tenga formato válido
        if (typeof NumeroAfiliado !== 'string' || NumeroAfiliado.trim() === '') {
            return res.status(400).json({ error: 'El número de afiliado no puede estar vacío' });
        }

        // 3. Verificar que el paciente existe
        const verificarPaciente = 'SELECT * FROM pacientes WHERE idPaciente = ?';
        db.query(verificarPaciente, [idPaciente], (error, pacienteResults) => {
            if (error) {
                console.error('Error al verificar paciente:', error);
                return res.status(500).json({ error: 'Error al verificar paciente' });
            }

            if (!pacienteResults || pacienteResults.length === 0) {
                return res.status(400).json({ error: 'El paciente especificado no existe' });
            }

            // 4. Verificar que el plan existe en planObraSocial
            const verificarPlan = 'SELECT * FROM planObraSocial WHERE idPlanObra = ?';
            db.query(verificarPlan, [idPlanObra], (errPlan, planResults) => {
                if (errPlan) {
                    console.error('Error al verificar plan en planObraSocial:', errPlan);
                    return res.status(500).json({ error: 'Error al verificar plan' });
                }

                if (!planResults || planResults.length === 0) {
                    return res.status(400).json({ error: 'El plan especificado no existe' });
                }

                // 5. Verificar que no exista ya un plan activo para este paciente con este plan
                const verificarPlanExistente = 'SELECT * FROM obraSocial_Paciente WHERE idPaciente = ? AND idPlanObra = ? AND EstadoPlan = "activo"';
                db.query(verificarPlanExistente, [idPaciente, idPlanObra], (errCheck, existingResults) => {
                    if (errCheck) {
                        console.error('Error al verificar plan existente:', errCheck);
                        return res.status(500).json({ error: 'Error al verificar plan existente' });
                    }

                    if (existingResults && existingResults.length > 0) {
                        return res.status(409).json({ error: 'El paciente ya tiene un plan activo con este idPlanObra' });
                    }

                    // Todas las validaciones pasadas, crear plan
                    const estadoFinal = EstadoPlan || 'activo';
                    const isActive = estadoFinal === 'activo' ? 1 : 0;

                    const nuevaPlanObra = 'INSERT INTO obraSocial_Paciente (idPaciente, idPlanObra, NumeroAfiliado, EstadoPlan, IsActive) VALUES (?, ?, ?, ?, ?)';
                    db.query(nuevaPlanObra, [idPaciente, idPlanObra, NumeroAfiliado, estadoFinal, isActive], (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error('Error al crear el plan de obra:', insertErr);
                            return res.status(500).json({ error: 'Error al crear el plan de obra' });
                        }
                        return res.status(201).json({
                            id: insertResult.insertId,
                            idPaciente,
                            idPlanObra,
                            NumeroAfiliado,
                            EstadoPlan: estadoFinal,
                            IsActive: isActive,
                            message: 'Plan de obra creado exitosamente'
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};

export const borradoLogicoPlanPaciente = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        // Solo cambiar IsActive a 0 (el EstadoPlan lo cambia el usuario)
        db.query('UPDATE obraSocial_Paciente SET IsActive = 0 WHERE idPacienteObra = ?', [idPacienteObra], (error, results) => {
            if (error) {
                console.error('Error al eliminar lógicamente el plan de obra:', error);
                res.status(500).json({ error: 'Error al eliminar lógicamente el plan de obra' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Plan de obra no encontrado' });
                return;
            }
            res.status(200).json({ 
                message: 'Plan de obra eliminado lógicamente',
                IsActive: 0
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const obtenerPlanesPacienteActivos = async (req, res) => {
    try {
        const obtenerPlanesActivos = 'SELECT * FROM obraSocial_Paciente WHERE IsActive = 1';
        db.query(obtenerPlanesActivos, (error, results) => {
            if (error) {
                console.error('Error al obtener planes activos:', error);
                return res.status(500).json({ error: 'Error al obtener planes activos' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const obtenerPlanesPacienteInactivos = async (req, res) => {
    try {
        const obtenerPlanesInactivos = 'SELECT * FROM obraSocial_Paciente WHERE IsActive = 0';
        db.query(obtenerPlanesInactivos, (error, results) => {
            if (error) {
                console.error('Error al obtener planes inactivos:', error);
                return res.status(500).json({ error: 'Error al obtener planes inactivos' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
