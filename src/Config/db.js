import mysql from "mysql2";
import dotenv from "dotenv";

// inicializo dotenv para leer las variables de entorno
dotenv.config();

// Configuro la conexión a la base de datos

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default conexion;
