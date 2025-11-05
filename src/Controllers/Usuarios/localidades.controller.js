import db from "../../Config/db.js";

export const traerLocalidades = (req, res) => {
  try {
    const localidades = "SELECT * FROM localidades";
    db.query(localidades, (error, results) => {
      if (error) {
        console.error("Error al ejecutar la consulta:", error);
        return res
          .status(500)
          .json({ message: "Error al traer las localidades" });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error al traer las localidades:", error);
    res.status(500).json({ message: "Error al traer las localidades" });
  }
};
