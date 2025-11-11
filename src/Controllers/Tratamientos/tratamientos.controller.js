import db from '../../Config/db.js';


export const obtenerTodosLosTratamientos = async (req, res) => {
    db.query("SELECT * FROM tratamientos", (err, results) => {
        if (err) return res.status(500).json({ message: "Error en base de datos" });
        res.json(results);
    });
};


export const obtenerTratamientoPorId = async (req, res) => {
    const id = parseInt(req.params.idTratamiento, 10);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    db.query("SELECT * FROM tratamientos WHERE idTratamiento = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(err ? 500 : 404).json({ message: err ? "Error" : "No encontrado" });
        res.json(results[0]);
    });
};

export const obtenerTratamientoPorNombre = async (req, res) => {
    const { nombre } = req.params;
    if (!nombre) return res.status(400).json({ message: "Falta nombre" });
    db.query("SELECT * FROM tratamientos WHERE NombreTratamiento = ?", [nombre], (err, results) => {
        if (err || results.length === 0) return res.status(err ? 500 : 404).json({ message: err ? "Error" : "No encontrado" });
        res.json(results[0]);
    });
};

export const obtenerTratamientosPorEstado = async (req, res) => {
    const isActive = req.params.estado === 'activo' ? 1 : 0;
    db.query("SELECT * FROM tratamientos WHERE IsActive = ?", [isActive], (err, results) => {
        if (err) return res.status(500).json({ message: "Error" });
        res.json(results);
    });
};

export const crearTratamiento = async (req, res) => {
    const { NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento } = req.body;
    if (!NombreTratamiento || !DescripcionTratamiento || !DuracionTratamiento) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const sql = `INSERT INTO tratamientos (NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento, IsActive) VALUES (?, ?, ?, ?, 1)`;
    db.query(sql, [NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento || null], (err, result) => {
        if (err) return res.status(err.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: err.code === 'ER_DUP_ENTRY' ? "Nombre duplicado" : "Error" });
        res.status(201).json({ message: "Creado", id: result.insertId });
    });
};

// === ACTUALIZAR 
export const actualizarTratamiento = async (req, res) => {
    const id = parseInt(req.params.idTratamiento, 10);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const { NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento } = req.body;
    if (!NombreTratamiento || !DescripcionTratamiento || !DuracionTratamiento) return res.status(400).json({ message: "Faltan campos" });

    db.query("SELECT idTratamiento FROM tratamientos WHERE NombreTratamiento = ? AND idTratamiento != ?", [NombreTratamiento, id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Error verificando nombre" });
        if (rows.length > 0) return res.status(409).json({ message: "Nombre ya en uso" });

        const sql = `UPDATE tratamientos SET NombreTratamiento = ?, DescripcionTratamiento = ?, DuracionTratamiento = ?, InformeTratamiento = ? WHERE idTratamiento = ?`;
        db.query(sql, [NombreTratamiento, DescripcionTratamiento, DuracionTratamiento, InformeTratamiento || null, id], (error, result) => {
            if (error || result.affectedRows === 0) return res.status(error ? 500 : 404).json({ message: error ? "Error" : "No encontrado" });
            res.json({ message: "Actualizado exitosamente" });
        });
    });
};

// === CAMBIAR ESTADO 
export const cambiarEstadoTratamiento = async (req, res) => {
    console.log("cambiarEstado →", req.params, req.body);
    const id = parseInt(req.params.idTratamiento, 10);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const { IsActive } = req.body;
    if (IsActive !== 0 && IsActive !== 1) return res.status(400).json({ message: "IsActive debe ser 0 o 1" });

    db.query("SELECT IsActive FROM tratamientos WHERE idTratamiento = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(err ? 500 : 404).json({ message: err ? "Error DB" : "No encontrado" });
        if (results[0].IsActive === IsActive) return res.status(400).json({ message: "Ya está en ese estado" });

        if (IsActive === 0) {
            const sql = `
                SELECT COALESCE((SELECT COUNT(*) FROM turnos WHERE idTratamiento = ?), 0) + 
                       COALESCE((SELECT COUNT(*) FROM turno_tratamientos WHERE idTratamiento = ?), 0) AS total
            `;
            db.query(sql, [id, id], (e, r) => {
                if (e) {
                    console.warn("Tablas de turnos no existen → se permite desactivar", e.message);
                    update();
                    return;
                }
                if ((r[0]?.total || 0) > 0) return res.status(409).json({ message: "En uso en turnos" });
                update();
            });
        } else update();

        function update() {
            db.query("UPDATE tratamientos SET IsActive = ? WHERE idTratamiento = ?", [IsActive, id], (e, r) => {
                if (e) return res.status(500).json({ message: "Error al actualizar estado" });
                res.json({ message: IsActive ? "Activado" : "Desactivado", success: true });
            });
        }
    });
};