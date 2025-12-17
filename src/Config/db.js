import mysql from "mysql2";
import dotenv from "dotenv";

// inicializo dotenv para leer las variables de entorno
dotenv.config();

// Crear una conexión única (createConnection)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Prevenir "Unhandled 'error' event" en conexión
db.on('error', (err) => {
  console.error('MySQL connection error ', err);
 
});

// Exportamos la conexión
export default db;
