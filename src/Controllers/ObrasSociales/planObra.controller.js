import db from '../../Config/db.js';

export const obtenerPlanesObra = async (req, res) => {
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

export const obtenerPlanObraPorId = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        const obtenerPlanObra = 'SELECT * FROM obraSocial_Paciente WHERE idPacienteObra = ?';
        db.query(obtenerPlanObra, [idPacienteObra], (error, results) => {
            if (error) {
                console.error('Error al obtener el plan de obra por ID:', error);
                res.status(500).json({ error: 'Error al obtener el plan de obra por ID' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ error: 'Plan de obra no encontrado' });
                return;
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const crearPlanObra = async (req, res) => {
    try {
        const { idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan } = req.body;
        
        // 1. Validar campos obligatorios
        if (!idPaciente || !idObraSocial || !PlanObraSocial || !NumeroAfiliado) {
            return res.status(400).json({ error: 'El paciente, obra social, plan y número de afiliado son obligatorios' });
        }

        // 2. Validar que NumeroAfiliado no esté vacío y tenga formato válido
        if (NumeroAfiliado.trim() === '') {
            return res.status(400).json({ error: 'El número de afiliado no puede estar vacío' });
        }

        // 3. Verificar que el paciente existe
        const verificarPaciente = 'SELECT * FROM pacientes WHERE idPaciente = ?';
        db.query(verificarPaciente, [idPaciente], (error, results) => {
            if (error) {
                console.error('Error al verificar paciente:', error);
                return res.status(500).json({ error: 'Error al verificar paciente' });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ error: 'El paciente especificado no existe' });
            }

            // 4. Verificar que la obra social existe
            const verificarObraSocial = 'SELECT * FROM obraSociales WHERE idObraSocial = ?';
            db.query(verificarObraSocial, [idObraSocial], (error, results) => {
                if (error) {
                    console.error('Error al verificar obra social:', error);
                    return res.status(500).json({ error: 'Error al verificar obra social' });
                }
                
                if (results.length === 0) {
                    return res.status(400).json({ error: 'La obra social especificada no existe' });
                }

                // 5. Verificar que no exista ya un plan activo para este paciente con esta obra social
                const verificarPlanExistente = 'SELECT * FROM obraSocial_Paciente WHERE idPaciente = ? AND idObraSocial = ? AND EstadoPlan = "activo"';
                db.query(verificarPlanExistente, [idPaciente, idObraSocial], (error, results) => {
                    if (error) {
                        console.error('Error al verificar plan existente:', error);
                        return res.status(500).json({ error: 'Error al verificar plan existente' });
                    }
                    
                    if (results.length > 0) {
                        return res.status(409).json({ error: 'El paciente ya tiene un plan activo con esta obra social' });
                    }

                    // Todas las validaciones pasadas, crear plan
                    const estadoFinal = EstadoPlan || 'activo';
                    const isActive = estadoFinal === 'activo' ? 1 : 0;
                    
                    const nuevaPlanObra = 'INSERT INTO obraSocial_Paciente (idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan, IsActive) VALUES (?, ?, ?, ?, ?, ?)';
                    db.query(nuevaPlanObra, [idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, estadoFinal, isActive], (error, results) => {
                        if (error) {
                            console.error('Error al crear el plan de obra:', error);
                            return res.status(500).json({ error: 'Error al crear el plan de obra' });
                        }
                        res.status(201).json({
                            id: results.insertId,
                            idPaciente,
                            idObraSocial,
                            PlanObraSocial,
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
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const borradoLogicoPlanObra = async (req, res) => {
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

export const obtenerPlanesActivos = async (req, res) => {
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

export const obtenerPlanesInactivos = async (req, res) => {
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
