import db from '../config/db.js';

export const obtenerObrasSociales = async (req, res) => {
        try {
        const obtenerTodasLasObrasSociales = 'SELECT * FROM obraSociales';
        db.query(obtenerTodasLasObrasSociales, (err, results) => {
            if (err) {
                console.error('Error al obtener las obras sociales:', err);
                res.status(500).json({ error: 'Error al obtener las obras sociales' });
                return;
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
}

export const obtenerObraSocialPorId = async (req, res) => {
    try {
        const { idObraSocial } = req.params;
        const obtenerObraSocial = 'SELECT * FROM obraSociales WHERE idObraSocial = ?';
        db.query(obtenerObraSocial, [idObraSocial], (error, results) => {
            if (error) {
                console.error('Error al obtener la obra social:', error);
                res.status(500).json({ error: 'Error al obtener la obra social' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ error: 'Obra social no encontrada' });
                return;
            }       
            res.status(200).json(results[0]);
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
export const crearObraSocial = async (req, res) => {
    try {
        const { nombreObraSocial, telefonoContacto, emailContacto, paginaWeb, estado } = req.body;
        const nuevaObraSocial = 'INSERT INTO obraSociales (nombreObraSocial, telefonoContacto, emailContacto, paginaWeb, estado) VALUES (?, ?, ?, ?, ?)';
        db.query(nuevaObraSocial, [nombreObraSocial, telefonoContacto, emailContacto, paginaWeb, estado], (err, results) => {
            if (err) {
                console.error('Error al crear la obra social:', err);
                res.status(500).json({ error: 'Error al crear la obra social' });
                return;
            }
            res.status(201).json({ 
                id: results.insertId, 
                nombreObraSocial, 
                telefonoContacto, 
                emailContacto, 
                paginaWeb, 
                estado,
                message: 'Obra social creada exitosamente'
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const actualizarObraSocial = async (req, res) => {
    try {
        const { idObraSocial } = req.params;    
        const { nombreObraSocial, telefonoContacto, emailContacto, paginaWeb, estado } = req.body;
        const actualizarObraSocial = 'UPDATE obraSociales SET nombreObraSocial = ?, telefonoContacto = ?, emailContacto = ?, paginaWeb = ?, estado = ? WHERE idObraSocial = ?';
        db.query(actualizarObraSocial, [nombreObraSocial, telefonoContacto, emailContacto, paginaWeb, estado, idObraSocial], (error, results) => {
            if (error) {
                console.error('Error al actualizar la obra social:', error);
                res.status(500).json({ error: 'Error al actualizar la obra social' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Obra social no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Obra social actualizada correctamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const borradoLogicoObraSocial = async (req, res) => {
    try {
        const { idObraSocial } = req.params;
        const actualizarObraSocial = 'UPDATE obraSociales SET isActive = 0 WHERE idObraSocial = ?';
        db.query(actualizarObraSocial, [idObraSocial], (error, results) => {
            if (error) {
                console.error('Error al realizar el borrado lógico de la obra social:', error);
                res.status(500).json({ error: 'Error al realizar el borrado lógico de la obra social' });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ error: 'Obra social no encontrada' });
                return;
            }
            res.status(200).json({ message: 'Obra social eliminada lógicamente correctamente' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
