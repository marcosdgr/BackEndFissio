import db from '../../config/db.js';


//obtener todas las obras sociales
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
//obtener obra social por id
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
//crear obra social
export const crearObraSocial = async (req, res) => {
    try {
        const { NombreObraSocial, TelefonoObra, EmailObra, PaginaWebObra, EstadoObra } = req.body;
        
        // 1. Validar campos obligatorios
        if (!NombreObraSocial || !TelefonoObra || !EmailObra) {
            return res.status(400).json({ error: 'El nombre, teléfono y email son obligatorios' });
        }

        // 2. Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(EmailObra)) {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        // 3. Validar formato de URL si se proporciona
        if (PaginaWebObra) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(PaginaWebObra)) {
                return res.status(400).json({ error: 'El formato de la página web no es válido' });
            }
        }

        // 4. Verificar que el teléfono no esté duplicado
        const verificarTelefono = 'SELECT * FROM obraSociales WHERE TelefonoObra = ?';
        db.query(verificarTelefono, [TelefonoObra], (error, results) => {
            if (error) {
                console.error('Error al verificar teléfono:', error);
                return res.status(500).json({ error: 'Error al verificar teléfono' });
            }
            
            if (results.length > 0) {
                return res.status(409).json({ error: 'Ya existe una obra social con ese teléfono' });
            }

            // 5. Verificar que el email no esté duplicado
            const verificarEmail = 'SELECT * FROM obraSociales WHERE EmailObra = ?';
            db.query(verificarEmail, [EmailObra], (error, results) => {
                if (error) {
                    console.error('Error al verificar email:', error);
                    return res.status(500).json({ error: 'Error al verificar email' });
                }
                
                if (results.length > 0) {
                    return res.status(409).json({ error: 'Ya existe una obra social con ese email' });
                }

                // 6. Verificar que la página web no esté duplicada (si existe)
                if (PaginaWebObra) {
                    const verificarWeb = 'SELECT * FROM obraSociales WHERE PaginaWebObra = ?';
                    db.query(verificarWeb, [PaginaWebObra], (error, results) => {
                        if (error) {
                            console.error('Error al verificar página web:', error);
                            return res.status(500).json({ error: 'Error al verificar página web' });
                        }
                        
                        if (results.length > 0) {
                            return res.status(409).json({ error: 'Ya existe una obra social con esa página web' });
                        }

                        // Todas las validaciones pasadas, crear obra social
                        crearObraSocialEnDB();
                    });
                } else {
                    // No hay página web, crear obra social
                    crearObraSocialEnDB();
                }
            });
        });

        // Función para crear la obra social
        function crearObraSocialEnDB() {
            const nuevaObraSocial = 'INSERT INTO obraSociales (NombreObraSocial, TelefonoObra, EmailObra, PaginaWebObra, EstadoObra) VALUES (?, ?, ?, ?, ?)';
            db.query(nuevaObraSocial, [NombreObraSocial, TelefonoObra, EmailObra, PaginaWebObra, EstadoObra], (err, results) => {
                if (err) {
                    console.error('Error al crear la obra social:', err);
                    return res.status(500).json({ error: 'Error al crear la obra social' });
                }
                res.status(201).json({ 
                    id: results.insertId, 
                    NombreObraSocial, 
                    TelefonoObra, 
                    EmailObra, 
                    PaginaWebObra, 
                    EstadoObra,
                    message: 'Obra social creada exitosamente'
                });
            });
        }
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
//actualizar obra social
export const actualizarObraSocial = async (req, res) => {
    try {
        const { idObraSocial } = req.params;    
        const { NombreObraSocial, TelefonoObra, EmailObra, PaginaWebObra, EstadoObra } = req.body;
        
        // 1. Validar campos obligatorios
        if (!NombreObraSocial || !TelefonoObra || !EmailObra) {
            return res.status(400).json({ error: 'El nombre, teléfono y email son obligatorios' });
        }

        // 2. Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(EmailObra)) {
            return res.status(400).json({ error: 'El formato del email no es válido' });
        }

        // 3. Validar formato de URL si se proporciona
        if (PaginaWebObra) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(PaginaWebObra)) {
                return res.status(400).json({ error: 'El formato de la página web no es válido' });
            }
        }

        // 4. Verificar que el teléfono no esté duplicado (excepto el actual)
        const verificarTelefono = 'SELECT * FROM obraSociales WHERE TelefonoObra = ? AND idObraSocial != ?';
        db.query(verificarTelefono, [TelefonoObra, idObraSocial], (error, results) => {
            if (error) {
                console.error('Error al verificar teléfono:', error);
                return res.status(500).json({ error: 'Error al verificar teléfono' });
            }
            
            if (results.length > 0) {
                return res.status(409).json({ error: 'Ya existe otra obra social con ese teléfono' });
            }

            // 5. Verificar que el email no esté duplicado (excepto el actual)
            const verificarEmail = 'SELECT * FROM obraSociales WHERE EmailObra = ? AND idObraSocial != ?';
            db.query(verificarEmail, [EmailObra, idObraSocial], (error, results) => {
                if (error) {
                    console.error('Error al verificar email:', error);
                    return res.status(500).json({ error: 'Error al verificar email' });
                }
                
                if (results.length > 0) {
                    return res.status(409).json({ error: 'Ya existe otra obra social con ese email' });
                }

                // 6. Verificar que la página web no esté duplicada (si existe)
                if (PaginaWebObra) {
                    const verificarWeb = 'SELECT * FROM obraSociales WHERE PaginaWebObra = ? AND idObraSocial != ?';
                    db.query(verificarWeb, [PaginaWebObra, idObraSocial], (error, results) => {
                        if (error) {
                            console.error('Error al verificar página web:', error);
                            return res.status(500).json({ error: 'Error al verificar página web' });
                        }
                        
                        if (results.length > 0) {
                            return res.status(409).json({ error: 'Ya existe otra obra social con esa página web' });
                        }

                        // Todas las validaciones pasadas, actualizar obra social
                        actualizarObraSocialEnDB();
                    });
                } else {
                    // No hay página web, actualizar obra social
                    actualizarObraSocialEnDB();
                }
            });
        });

        // Función para actualizar la obra social
        function actualizarObraSocialEnDB() {
            const actualizarObraSocial = 'UPDATE obraSociales SET NombreObraSocial = ?, TelefonoObra = ?, EmailObra = ?, PaginaWebObra = ?, EstadoObra = ? WHERE idObraSocial = ?';
            db.query(actualizarObraSocial, [NombreObraSocial, TelefonoObra, EmailObra, PaginaWebObra, EstadoObra, idObraSocial], (error, results) => {
                if (error) {
                    console.error('Error al actualizar la obra social:', error);
                    return res.status(500).json({ error: 'Error al actualizar la obra social' });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: 'Obra social no encontrada' });
                }
                res.status(200).json({ message: 'Obra social actualizada correctamente' });
            });
        }
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
//borrado logico de obra social
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
//obtener las obras sociales activas
export const obtenerObraSocialActiva = async (req, res) => {
    try {
        const obtenerObrasSocialesActivas = 'SELECT * FROM obraSociales WHERE isActive = 1';
        db.query(obtenerObrasSocialesActivas, (error, results) => {
            if (error) {
                console.error('Error al obtener obras sociales activas:', error);
                return res.status(500).json({ error: 'Error al obtener obras sociales activas' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
//obtener las obras sociales inactivas
export const obtenerObraSocialInactiva = async (req, res) => {
    try {
        const obtenerObrasSocialesInactivas = 'SELECT * FROM obraSociales WHERE isActive = 0';
        db.query(obtenerObrasSocialesInactivas, (error, results) => {
            if (error) {
                console.error('Error al obtener obras sociales inactivas:', error);
                return res.status(500).json({ error: 'Error al obtener obras sociales inactivas' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
