import db from "../../Config/db.js";

// Obtener todos los medios de pago
export const obtenerMediosPago = async (req, res) => {
    try {
        const obtenerMedios = "SELECT * FROM catMediosPago";
        db.query(obtenerMedios, (error, results) => {
            if (error) {
                console.error("Error al obtener los medios de pago: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los medios de pago" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No hay medios de pago registrados" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}
// Obtener medio de pago por id
export const obtenerMedioPagoPorId = async (req, res) => {
    try {
        const { idMedioPago } = req.params;
        const obtenerMedioId = "SELECT * FROM catMediosPago WHERE idMedioPago = ?";
        db.query(obtenerMedioId, [idMedioPago], (error, results) => {
            if (error) {
                console.error("Error al obtener el medio de pago por ID: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener el medio de pago por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Medio de pago no encontrado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}
// Crear un nuevo medio de pago
export const crearMedioPago = async (req, res) => {
    try {
        const{ NombreMedio, DescripcionMedio} = req.body
        //validacion simple para llenar el campo de nombre y que sea solo texto
        if (!NombreMedio || typeof NombreMedio !== "string" || NombreMedio.trim() === "") {
            return res.status(400).json({ error: "El campo 'Nombre' es obligatorio." });
        }
        const nuevoMedioPago = "INSERT INTO catMediosPago (NombreMedio, DescripcionMedio) VALUES (?, ?)";
        db.query(nuevoMedioPago, [NombreMedio, DescripcionMedio], (error, results) => {
            if (error) {
                console.error("Error al crear un nuevo medio de pago: ", error);
                return res.status(500).json({ error: "Error del servidor al crear un nuevo medio de pago" });
            }
            res.status(201).json({ message: "Nuevo medio de pago creado exitosamente", idInsertado: results.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }   
}
// Actualizar un medio de pago existente
export const actualizarMedioPago = async (req, res) => {
    try {
        const { idMedioPago } = req.params;
        const { NombreMedio, DescripcionMedio } = req.body;
        
        // validacion simple para llenar el campo de nombre y que sea solo texto
        if (!NombreMedio || typeof NombreMedio !== "string" || NombreMedio.trim() === "") {
            return res.status(400).json({ error: "El campo 'Nombre' es obligatorio." });
        }
        const actualizarMedio = "UPDATE catMediosPago SET NombreMedio = ?, DescripcionMedio = ? WHERE idMedioPago = ?";
        db.query(actualizarMedio, [NombreMedio.trim(), DescripcionMedio || null , idMedioPago], (error, results) => {
            if (error) {
                console.error("Error al actualizar el medio de pago: ", error);
                return res.status(500).json({ error: "Error del servidor al actualizar el medio de pago" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Medio de pago no encontrado" });
            }   
            res.status(200).json({ message: "Medio de pago actualizado exitosamente" });
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}
// Eliminar un medio de pago
export const eliminarMedioPago = async (req, res) => {
    try {
        const { idMedioPago } = req.params;
        const eliminarMedio = "DELETE FROM catMediosPago WHERE idMedioPago = ?";
        db.query(eliminarMedio, [idMedioPago], (error, results) => {
            if (error) {
                console.error("Error al eliminar el medio de pago: ", error);
                return res.status(500).json({ error: "Error del servidor al eliminar el medio de pago" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Medio de pago no encontrado" });
            }
            res.status(200).json({ message: "Medio de pago eliminado exitosamente" });
        });
    }catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }   
}