import db from '../db.js';

export const obtenerPlanesObra = async (req, res) => {
    try {
        const obtenerTodosLosPlanesObra = 'SELECT * FROM obraSocial_Paciente';
        const resultado = await db.query(obtenerTodosLosPlanesObra);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener los planes de obra:', error);
        res.status(500).json({ error: 'Error al obtener los planes de obra' });
    }
};

export const obtenerPlanObraPorId = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        const obtenerPlanObra = 'SELECT * FROM obraSocial_Paciente WHERE idPacienteObra = ?';
        const resultado = await db.query(obtenerPlanObra, [idPacienteObra]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Plan de obra no encontrado' });
        }
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error('Error al obtener el plan de obra por ID:', error);
        res.status(500).json({ error: 'Error al obtener el plan de obra por ID' });
    }
};

export const crearPlanObra = async (req, res) => {
    try {
        const { idPaciente, idObraSocial, numeroAfiliado, fechaInicio, fechaFin, estado } = req.body;
        const nuevaPlanObra = 'INSERT INTO obraSocial_Paciente (idPaciente, idObraSocial, numeroAfiliado, plan ObraSocial, estadoPlan) VALUES (?, ?, ?, ?, ?)';
        const resultado = await db.query(nuevaPlanObra, [idPaciente, idObraSocial, numeroAfiliado, fechaInicio, fechaFin, estado]);
        res.status(201).json({ 
            id: resultado.insertId,
            idPaciente,
            idObraSocial,
            numeroAfiliado,
            fechaInicio,
            fechaFin,
            estado
        });
    } catch (error) {
        console.error('Error al crear el plan de obra:', error);
        res.status(500).json({ error: 'Error al crear el plan de obra' });
    }
};  
export const actualizarPlanObra = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        const { idPaciente, idObraSocial, numeroAfiliado, fechaInicio, fechaFin, estado } = req.body;
        const actualizarPlanObra = 'UPDATE obraSocial_Paciente SET idPaciente = ?, idObraSocial = ?, numeroAfiliado = ?, fechaInicio = ?, fechaFin = ?, estado = ? WHERE idPacienteObra = ?';
        const resultado = await db.query(actualizarPlanObra, [idPaciente, idObraSocial, numeroAfiliado, fechaInicio, fechaFin, estado, idPacienteObra]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Plan de obra no encontrado' });
        }
        res.json({ message: 'Plan de obra actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el plan de obra:', error);
        res.status(500).json({ error: 'Error al actualizar el plan de obra' });
    }
};
export const borradoLogicoPlanObra = async (req, res) => {
    try {
        const { idPacienteObra } = req.params;
        const resultado = await db.query('UPDATE obraSocial_Paciente SET estado = ? WHERE idPacienteObra = ?', ['inactivo', idPacienteObra]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Plan de obra no encontrado' });
        }
        res.json({ message: 'Plan de obra eliminado lógicamente' });
    } catch (error) {
        console.error('Error al eliminar lógicamente el plan de obra:', error);
        res.status(500).json({ error: 'Error al eliminar lógicamente el plan de obra' });
    }
};
