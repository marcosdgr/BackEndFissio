import e from "cors";
import db from "../Config/db.js";

// Traer todos los pagos 

export const obtenerPagos = async (req, res) => {
    try {
        const obtenerTodosLosPagos = "SELECT * FROM pagos";
        db.query(obtenerTodosLosPagos, (error, results) => {
            if (error) {
                console.error("Error al obtener todos los pagos: ", error);
                res.status(500).json({ error: "Error del servidor al obtener todos los pagos" });
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
        const obtenerUnPagoId = "SELECT * FROM pagos WHERE idPago = ?";
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

// Filtro para traer los pagos activos

export const obtenerPagosActivos = async (req, res) => {
    try {
        const obtenerTodosPagosActivos = "SELECT * FROM pagos WHERE IsActive = 1";
        db.query(obtenerTodosPagosActivos, (error, results) => {
            if (error) {
                console.error("Error al obtener los pagos activos: ", error);
                res.status(500).json({ error: "Error del servidor al obtener los pagos activos" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Filtro para traer los pagos inactivos

export const obtenerPagosInactivos = async (req, res) => {
    try {
        const obtenerTodosPagosInactivos = "SELECT * FROM pagos WHERE IsActive = 0";
        db.query(obtenerTodosPagosInactivos, (error, results) => {
            if (error) {
                console.error("Error al obtener los pagos inactivos: ", error);
                res.status(500).json({ error: "Error del servidor al obtener los pagos inactivos" });
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
        const nuevoPago = "INSERT INTO pagos (FechaPago, TipoPago, Descripcion, MedioPago, MontoPago, EstadoPago) VALUES (?, ?, ?, ?, ?, ?)";
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
        const { FechaPago, TipoPago, Descripcion, MedioPago, MontoPago, EstadoPago } = req.body;
        const actualizarUnPago = "UPDATE pagos SET FechaPago = ?, TipoPago = ?, Descripcion = ?, MedioPago = ?, MontoPago = ?, EstadoPago = ? WHERE idPago = ?";
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

// Borrado logico de un pago

export const borradoLogicoPago = async (req, res) => {
    try {
        const { idPago } = req.params;
        const borradoLogico = "UPDATE pagos SET IsActive = 0 WHERE idPago = ?";
        db.query(borradoLogico, [idPago], (error, results) => {
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