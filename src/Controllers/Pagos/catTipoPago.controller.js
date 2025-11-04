import db from "../../Config/db.js";

//Obtener todos los tipos de pago 
export const obtenerTiposPago = async (req, res) => {
    try {
        const obtenerTipos = "SELECT * FROM catTiposPago";
        db.query(obtenerTipos, (error, results) => {
            if (error) {
                console.error("Error al obtener los tipos de pago: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los tipos de pago" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No hay tipos de pago registrados" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }   
}

// Obtener tipo de pago por id
export const obtenerTipoPagoPorId = async (req, res) => {
    try {
        const { idTipoPago } = req.params;
        const obtenerTipoId = "SELECT * FROM catTiposPago WHERE idTipoPago = ?";
        db.query(obtenerTipoId, [idTipoPago], (error, results) => {
            if (error) {
                console.error("Error al obtener el tipo de pago por ID: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener el tipo de pago por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Tipo de pago no encontrado" });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Crear un nuevo tipo de pago
export const crearTipoPago = async (req, res) => {
    try {
        const{ NombreTipo, DescripcionTipo} = req.body
        //validacion simple para llenar el campo de nombre y que sea solo texto
        if (!NombreTipo || typeof NombreTipo !== "string" || NombreTipo.trim() === "") {
            return res.status(400).json({ error: "El campo 'Nombre' es obligatorio." });
        }
        const nuevoTipoPago = "INSERT INTO catTiposPago (NombreTipo, DescripcionTipo) VALUES (?, ?)";
        db.query(nuevoTipoPago, [NombreTipo.trim(), DescripcionTipo || null], (error, results) => {
            if (error){
                console.error ("Error al crear el tipo de pago", error)
                return res.status(500).json({error:"Error"})
            }  
            res.status(201).json({message: "Tipo de pago creado correctamente", idInsertado: results.insertId });
        });
    } catch (error) {
        res.status(500).json({error: "Error del servidor"})
    }
}

// Actualizar tipo de pago
export const actualizarTipoPago = async (req, res) => {
    try {
        const { idTipoPago } = req.params;
        const { NombreTipo, DescripcionTipo } = req.body;

        if (!NombreTipo || typeof NombreTipo !== "string" || NombreTipo.trim() === "") {
            return res.status(400).json({ message: "El campo 'NombreTipo' es obligatorio" });
        }

        const query = "UPDATE catTiposPago SET NombreTipo = ?, DescripcionTipo = ? WHERE idTipoPago = ?";
        db.query(query, [NombreTipo.trim(), DescripcionTipo || null, idTipoPago], (error, results) => {
            if (error) {
                console.error("Error al actualizar el tipo de pago:", error);
                return res.status(500).json({ error: "Error del servidor al actualizar el tipo de pago" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Tipo de pago no encontrado" });
            }
            res.status(200).json({ message: "Tipo de pago actualizado correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor" });
    }
}

// Eliminar tipo de pago
export const eliminarTipoPago = async (req, res) => {
    try {
        const {idTipoPago} = req.params;
        const borrarTipo = "DELETE FROM catTiposPago WHERE idTipoPago = ?";
        db.query (borrarTipo, [idTipoPago],(error, results)=>{
            if (error){
                console.error ("Error al eliminar tipo de pago", error);
                return res.status(500)({error:"Error del servidor al eliminar tipo de pago"});
            }
            if (results === 0) {
                return res.status (404).json({message: "Tipo de pago no encontrado"});
            }
            res.status(200).json({messaje: "Tipo de pago eliminado correctamente"})
        });
    } catch (error) {
        res.status(500).json({eroor : "Error del servidor"});
    }
}