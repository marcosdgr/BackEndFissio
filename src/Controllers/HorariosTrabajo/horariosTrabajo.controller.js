import db from "../../Config/db.js";

// Traer todos los horarios de trabajo
export const obtenerHorariosTrabajo = async (req, res) => {
    try {
        const obtenerHorarios = "SELECT * FROM horariosTrabajo";
        db.query(obtenerHorarios,(error, results)=>{
            if (error){
                console.error ("Error al obtener los horarios", error);
                return res.status(500).json({error:"Error del servidor al traer los horarios"});
            }
            if (results.length === 0){
                return res.status(404).json({message:"No hay horarios registrados"});
            }
            res.status(200).json(results);
        });

    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

//Traer horario por id
export const obtenerHorarioPorId = async (req, res) => {
    try {
        const {idHorario} = req.params;
        const obtenerHorarioId = "SELECT * FROM horariosTrabajo WHERE idHorario = ?";
        db.query(obtenerHorarioId, [idHorario], (error, results) => {
            if (error) {
                console.error("Error al obtener el horario por ID: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener el horario por ID" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Horario no encontrado" });
            }
            res.status(200).json(results);
        } );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

//Traer horarios activos
export const obtenerHorariosActivos = async (req, res) => {
    try {
        const obtenerHorariosActivos = "SELECT * FROM horariosTrabajo WHERE IsActive = 1";
        db.query(obtenerHorariosActivos, (error, results) => {
            if (error) {
                console.error("Error al obtener los horarios activos: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los horarios activos" });
            }
            res.status(200).json(results);
        } );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

//Traer horarios inactivos
export const obtenerHorariosInactivos = async (req, res) => {
    try {
        const obtenerHorariosInactivos = "SELECT * FROM horariosTrabajo WHERE IsActive = 0";
        db.query(obtenerHorariosInactivos, (error, results) => {
            if (error) {
                console.error("Error al obtener los horarios inactivos: ", error);
                return res.status(500).json({ error: "Error del servidor al obtener los horarios inactivos" });
            }
            res.status(200).json(results);
        } );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

// Crear un nuevo horario de trabajo
export const crearHorarioTrabajo = async (req, res) => {
    try {
        const {Fecha, HoraEntradaEsperada, HoraSalidaEsperada, DescripcionHorario} = req.body;
        if (!Fecha) {
            return res.status(400).json({ message: "La Fecha es requerida (formato: YYYY-MM-DD)" });
        }
        const nuevoHorarioTrabajo = "INSERT INTO horariosTrabajo (Fecha, HoraEntradaEsperada, HoraSalidaEsperada, DescripcionHorario) VALUES (?, ?, ?, ?)";
        db.query(nuevoHorarioTrabajo, [Fecha, HoraEntradaEsperada, HoraSalidaEsperada, DescripcionHorario], (error, results) => {
            if (error) {
                console.error("Error al crear el nuevo horario de trabajo: ", error);
                return res.status(500).json({ error: "Error del servidor al crear el nuevo horario de trabajo" });
            }
            res.status(201).json({ message: "Nuevo horario de trabajo creado exitosamente", idInsertado: results.insertId });
        } );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

// Actualizar un horario de trabajo
export const actualizarHorarioTrabajo = async (req, res) => {
    try {
        const {idHorario} = req.params;
        const {Fecha, HoraEntradaEsperada, HoraSalidaEsperada, DescripcionHorario} = req.body;
        const actualizarHorario = "UPDATE horariosTrabajo SET Fecha = ?, HoraEntradaEsperada = ?, HoraSalidaEsperada = ?, DescripcionHorario = ? WHERE idHorario = ?";
        db.query(actualizarHorario, [Fecha, HoraEntradaEsperada, HoraSalidaEsperada, DescripcionHorario, idHorario], (error, results) => {
            if (error) {
                console.error("Error al actualizar el horario de trabajo: ", error);
                return res.status(500).json({ error: "Error del servidor al actualizar el horario de trabajo" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Horario de trabajo no encontrado" });
            }
            res.status(200).json({ message: "Horario de trabajo actualizado exitosamente" });
        } );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

// Desactivacion logica de un horario de trabajo
export const borradoLogicoHorarioTrabajo = async (req, res) => {
    try {
        const {idHorario} = req.params;
        const borradoLogico = "UPDATE horariosTrabajo SET IsActive = 0 WHERE idHorario = ?";
        db.query(borradoLogico, [idHorario], (error, results) => {
            if (error) {
                console.error("Error al realizar el borrado lógico del horario de trabajo: ", error);
                return res.status(500).json({ error: "Error del servidor al realizar el borrado lógico del horario de trabajo" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Horario de trabajo no encontrado" });
            }
            res.status(200).json({ message: "Borrado lógico del horario de trabajo realizado exitosamente" });
        }  );
    }
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}

//Activacion logica de un horario de trabajo
export const activacionLogicaHorarioTrabajo = async (req, res) => {
    try {
        const {idHorario} = req.params;
        const activacionLogica = "UPDATE horariosTrabajo SET IsActive = 1 WHERE idHorario = ?";
        db.query(activacionLogica, [idHorario], (error, results) => {
            if (error) {
                console.error("Error al realizar la activacion del horario de trabajo: ", error);
                return res.status(500).json({ error: "Error del servidor al activar del horario de trabajo" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Horario de trabajo no encontrado" });
            }
            res.status(200).json({ message: "Activacion del horario de trabajo realizado exitosamente" });
        }  );
    }   
    catch(error){
        res.status(500).json({error:"Error del servidor"});
    }
}
