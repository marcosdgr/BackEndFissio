import db from '../../Config/db.js';

//Obtener y listar todos los cobros con datos enriquecidos utilizando join para tener una mejor vista de los datos 
export const obtenerCobros = async (req, res) => {
    try {
        const obtenerTodosLosCobros = "SELECT  c.idCobro, c.FechaCobro, c.TipoCobro, c.MontoCobro, c.EstadoCobro, c.Descripcion, mp.NombreMedio AS MedioPago, t.idTurno, CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente, CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS Profesional FROM cobros c JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago JOIN turnos t ON c.idTurno = t.idTurno JOIN pacientes p ON t.idPaciente = p.idPaciente JOIN empleados e ON t.idEmpleado = e.idEmpleado ORDER BY c.FechaCobro DESC";
        db.query(obtenerTodosLosCobros, (error, results) => {
            if (error) {
                console.error("Error al obtener los cobros: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los cobros" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Obtener cobro por id
export const obtenerCobroPorId = async (req, res) => {
    try {
        const { idCobro } = req.params;
        const obtenerUnCobroId = "SELECT  c.idCobro, c.FechaCobro, c.TipoCobro, c.MontoCobro, c.EstadoCobro, c.Descripcion, mp.NombreMedio AS MedioPago, t.idTurno, CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente, CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS Profesional FROM cobros c JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago JOIN turnos t ON c.idTurno = t.idTurno JOIN pacientes p ON t.idPaciente = p.idPaciente JOIN empleados e ON t.idEmpleado = e.idEmpleado WHERE c.idCobro = ?";
        db.query(obtenerUnCobroId, [idCobro], (error, results) => {
            if (error) {
                console.error("Error al obtener el cobro por ID: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener el cobro por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Cobro no encontrado" });
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};

//Obtener cobros por estado
export const obtenerCobrosPorEstado = async (req, res) => {
    try {
        const { estado } = req.params; // Cambiado de EstadoCobro a estado (debe coincidir con la ruta)
        const obtenerCobrosEstado = "SELECT  c.idCobro, c.FechaCobro, c.TipoCobro, c.MontoCobro, c.EstadoCobro, c.Descripcion, mp.NombreMedio AS MedioPago, t.idTurno, CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente, CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS Profesional FROM cobros c JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago JOIN turnos t ON c.idTurno = t.idTurno JOIN pacientes p ON t.idPaciente = p.idPaciente JOIN empleados e ON t.idEmpleado = e.idEmpleado WHERE c.EstadoCobro = ? ORDER BY c.FechaCobro DESC";
        db.query(obtenerCobrosEstado, [estado], (error, results) => {
            if (error) {    
                console.error("Error al obtener los cobros por estado: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los cobros por estado" });
            }   
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};

//Obtener cobros por turno
export const obtenerCobrosPorTurno = async (req, res) => {
    try {
        const { idTurno } = req.params;
        const obtenerCobrosTurno = "SELECT  c.idCobro, c.FechaCobro, c.TipoCobro, c.MontoCobro, c.EstadoCobro, c.Descripcion, mp.NombreMedio AS MedioPago, t.idTurno, CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente, CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS Profesional FROM cobros c JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago JOIN turnos t ON c.idTurno = t.idTurno JOIN pacientes p ON t.idPaciente = p.idPaciente JOIN empleados e ON t.idEmpleado = e.idEmpleado WHERE c.idTurno = ? ORDER BY c.FechaCobro DESC";
        db.query(obtenerCobrosTurno, [idTurno], (error, results) => {
            if (error) {
                console.error("Error al obtener los cobros por turno: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los cobros por turno" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};  

//Obtener todos los cobros de una fecha específica
export const obtenerCobrosPorFecha = async (req, res) => {
    try {
        const { fecha } = req.params; // Cambiado de FechaCobro a fecha (debe coincidir con la ruta)
        const obtenerCobrosFecha = "SELECT  c.idCobro, c.FechaCobro, c.TipoCobro, c.MontoCobro, c.EstadoCobro, c.Descripcion, mp.NombreMedio AS MedioPago, t.idTurno, CONCAT(p.NombrePaciente, ' ', p.ApellidoPaciente) AS Paciente, CONCAT(e.NombreEmpleado, ' ', e.ApellidoEmpleado) AS Profesional FROM cobros c JOIN catMediosPago mp ON c.idMedioPago = mp.idMedioPago JOIN turnos t ON c.idTurno = t.idTurno JOIN pacientes p ON t.idPaciente = p.idPaciente JOIN empleados e ON t.idEmpleado = e.idEmpleado WHERE DATE(c.FechaCobro) = ? ORDER BY c.FechaCobro DESC";
        db.query(obtenerCobrosFecha, [fecha], (error, results) => {
            if (error) {
                console.error("Error al obtener los cobros por fecha: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los cobros por fecha" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};

// Crear un nuevo cobro
export const crearCobro = async (req, res) => {
    try {
        const { FechaCobro, TipoCobro, MontoCobro, EstadoCobro, Descripcion, idMedioPago, idTurno } = req.body; // idTurno ahora viene del body
        
        // Validar campos obligatorios
        if (!FechaCobro || !TipoCobro || MontoCobro === undefined || !EstadoCobro || !idMedioPago || !idTurno) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const nuevoCobro = "INSERT INTO cobros (FechaCobro, TipoCobro, MontoCobro, EstadoCobro, Descripcion, idMedioPago, idTurno) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(nuevoCobro, [FechaCobro, TipoCobro, MontoCobro, EstadoCobro, Descripcion, idMedioPago, idTurno], (error, results) => {
            if (error) {
                console.error("Error al crear un nuevo cobro: ", error);
                return res.status(500).json({ error: "Error del servidor al crear un nuevo cobro" });
            }
            res.status(201).json({ message: "Cobro creado exitosamente", idCobro: results.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};
// Actualizar un cobro existente (actualización dinámica con validaciones)
export const actualizarCobro = async (req, res) => {
    try {
        const { idCobro } = req.params;
        const { FechaCobro, TipoCobro, MontoCobro, EstadoCobro, Descripcion, idMedioPago, idTurno } = req.body;

        // Validar campos críticos para cuando quieran actualizar no se envien vacios o null o negativos
        if (MontoCobro !== undefined && (MontoCobro === null || MontoCobro === "" || MontoCobro < 0)) {
            return res.status(400).json({ error: "El MontoCobro debe ser un valor válido mayor o igual a 0" });
        }
        if (EstadoCobro !== undefined && (EstadoCobro === null || EstadoCobro === "")) {
            return res.status(400).json({ error: "El EstadoCobro no puede estar vacío" });
        }
        if (idMedioPago !== undefined && (idMedioPago === null || idMedioPago === "" || idMedioPago <= 0)) {
            return res.status(400).json({ error: "El idMedioPago debe ser un ID válido" });
        }
        if (idTurno !== undefined && (idTurno === null || idTurno === "" || idTurno <= 0)) {
            return res.status(400).json({ error: "El idTurno debe ser un ID válido" });
        }
        if (TipoCobro !== undefined && (TipoCobro === null || TipoCobro === "")) {
            return res.status(400).json({ error: "El TipoCobro no puede estar vacío" });
        }
        if (FechaCobro !== undefined && (FechaCobro === null || FechaCobro === "")) {
            return res.status(400).json({ error: "La FechaCobro no puede estar vacía" });
        }

        // Construir query dinámica
        const atributos = [];
        const valores = [];

        if (FechaCobro !== undefined) {
            atributos.push("FechaCobro = ?");
            valores.push(FechaCobro);
        }
        if (TipoCobro !== undefined) {
            atributos.push("TipoCobro = ?");
            valores.push(TipoCobro);
        }
        if (MontoCobro !== undefined) {
            atributos.push("MontoCobro = ?");
            valores.push(MontoCobro);
        }
        if (EstadoCobro !== undefined) {
            atributos.push("EstadoCobro = ?");
            valores.push(EstadoCobro);
        }
        if (Descripcion !== undefined) { // Descripcion SÍ puede estar vacía 
            atributos.push("Descripcion = ?");
            valores.push(Descripcion);
        }
        if (idMedioPago !== undefined) {
            atributos.push("idMedioPago = ?");
            valores.push(idMedioPago);
        }
        if (idTurno !== undefined) {
            atributos.push("idTurno = ?");
            valores.push(idTurno);
        }

        if (atributos.length === 0) {
            return res.status(400).json({ error: "No se proporcionaron campos para actualizar" });
        }

        valores.push(idCobro);
        const actualizarCobro = "UPDATE cobros SET " + atributos.join(", ") + " WHERE idCobro = ?";

        db.query(actualizarCobro, valores, (error, results) => {
            if (error) {
                console.error("Error al actualizar el cobro: ", error);
                return res.status(500).json({ error: "Error del servidor al actualizar el cobro" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "Cobro no encontrado" });
            }
            res.status(200).json({ message: "Cobro actualizado exitosamente" });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};
// Borrado físico de un cobro
export const eliminarCobro = async (req, res) => {
    try {
        const { idCobro } = req.params;
        const eliminarCobro = "DELETE FROM cobros WHERE idCobro = ?";
        db.query(eliminarCobro, [idCobro], (error, results) => {
            if (error) {
                console.error("Error al eliminar el cobro: ", error);
                return res.status(500).json({ error: "Error del servidor al eliminar el cobro" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: "Cobro no encontrado" });
            }
            res.status(200).json({ message: "Cobro eliminado exitosamente" });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
};