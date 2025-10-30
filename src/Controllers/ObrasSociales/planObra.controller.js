import db from '../../config/db.js';

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
        const nuevaPlanObra = 'INSERT INTO obraSocial_Paciente (idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan) VALUES (?, ?, ?, ?, ?)';
        db.query(nuevaPlanObra, [idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan], (err, results) => {
            if (err) {
                console.error('Error al crear el plan de obra:', err);
                res.status(500).json({ error: 'Error al crear el plan de obra' });
                return;
            }
            res.status(201).json({
                id: results.insertId,
                idPaciente,
                idObraSocial,
                PlanObraSocial,
                NumeroAfiliado,
                EstadoPlan,
                message: 'Plan de obra creado exitosamente'
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
export const actualizarPlanObra = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        const { idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan } = req.body;
        const actualizarPlanObra = 'UPDATE obraSocial_Paciente SET idPaciente = ?, idObraSocial = ?, PlanObraSocial = ?, NumeroAfiliado = ?, EstadoPlan = ? WHERE idPacienteObra = ?';
        db.query(actualizarPlanObra, [idPaciente, idObraSocial, PlanObraSocial, NumeroAfiliado, EstadoPlan, idPacienteObra], (error, results) => {
            if (error) {
                console.error('Error al actualizar el plan de obra:', error);
                res.status(500).json({ error: 'Error al actualizar el plan de obra' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Plan de obra no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Plan de obra actualizado exitosamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
export const borradoLogicoPlanObra = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        db.query('UPDATE obraSocial_Paciente SET EstadoPlan = ? WHERE idPacienteObra = ?', ['inactivo', idPacienteObra], (error, results) => {
            if (error) {
                console.error('Error al eliminar lógicamente el plan de obra:', error);
                res.status(500).json({ error: 'Error al eliminar lógicamente el plan de obra' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Plan de obra no encontrado' });
                return;
            }
            res.status(200).json({ message: 'Plan de obra eliminado lógicamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
