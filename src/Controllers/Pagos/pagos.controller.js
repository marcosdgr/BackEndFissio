import e from "cors";
import db from "../../Config/db.js";

// Traer todos los pagos 

export const obtenerPagos = async (req, res) => {
    try {
        const obtenerTodosLosPagos = "SELECT p.idPago, p.FechaPago,p.MontoPago,p.Descripcion,p.EstadoPago,mp.NombreMedio as MedioPago, tp.NombreTipo as TipoPago FROM pagos p JOIN catMediosPago mp ON p.idMedioPago = mp.idMedioPago JOIN catTiposPago tp ON p.idTipoPago = tp.idTipoPago ORDER BY P.FechaPago DESC";

        db.query(obtenerTodosLosPagos, (error, results) => {
            if (error) {
                console.error("Error al obtener los pagos: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los pagos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });

    }
}

// Filtro para traer pagos por id 

export const obtenerPagoPorId = async (req, res) => {
    try {
        const { idPago } = req.params;
        const obtenerUnPagoId = "SELECT p.idPago, p.FechaPago,p.MontoPago,p.Descripcion,p.EstadoPago,mp.NombreMedio AS MedioPago, tp.NombreTipo AS TipoPago FROM pagos p JOIN catMediosPago mp ON p.idMedioPago = mp.idMedioPago JOIN catTiposPago tp ON p.idTipoPago = tp.idTipoPago WHERE p.idPago = ?";
        db.query(obtenerUnPagoId, [idPago], (error, results) => {
            if (error) {
                console.error("Error al obtener el pago por ID: ", error);
                res.status(500).json({ error: "Error del servidor al obtener el pago por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Crear un nuevo pago

export const crearPago = async (req, res) => {
    try {
        const {
            FechaPago, TipoPago, Descripcion, MedioPago, MontoPago, EstadoPago
        } = req.body
        const nuevoPago = "INSERT INTO pagos (FechaPago, MontoPago, Descripcion, EstadoPago,idMedioPago, idTipoPago) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(nuevoPago, [FechaPago, TipoPago, Descripcion, MedioPago, MontoPago, EstadoPago], (error, results) => {
            if (error) {
                console.error("Error al crear un nuevo pago: ", error);
                res.status(500).json({ error: "Error del servidor al crear un nuevo pago" });
            }
            res.status(201).json({ message: "Nuevo pago creado exitosamente", idInsertado: results.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Actualizar un pago 

export const actualizarPago = async (req, res) => {
    try {
        const { idPago } = req.params;
        const { FechaPago, MontoPago, Descripcion, EstadoPago,idMedioPago, idTipoPago } = req.body;
        const actualizarUnPago = "UPDATE pagos SET FechaPago = ?, MontoPago = ?, Descripcion = ?, EstadoPago = ?, idMedioPago = ?, idTipoPago = ? WHERE idPago = ?";
        db.query(actualizarUnPago, [FechaPago, TipoPago, Descripcion, MedioPago, MontoPago, EstadoPago, idPago], (error, results) => {
            if (error) {
                console.error("Error al actualizar el pago: ", error);
                res.status(500).json({ error: "Error del servidor al actualizar el pago" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            res.status(200).json({ message: "Pago actualizado exitosamente" });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Borrado Fisico de un pago

export const eliminarPago = async (req, res) => {
    try {
        const { idPago } = req.params;
        const eliminar = "DELETE FROM pagos WHERE idPago = ?";
        db.query(eliminar, [idPago], (error, results) => {
            if (error) {
                console.error("Error al realizar el borrado logico del pago: ", error);
                res.status(500).json({ error: "Error del servidor al realizar el borrado logico del pago" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Pago no encontrado" });
            }
            res.status(200).json({ message: "Borrado logico del pago realizado exitosamente" });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}