import mysql from "mysql2";
import dotenv from "dotenv";

// inicializo dotenv para leer las variables de entorno
dotenv.config();

// Crear un pool de conexiones
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prevenir "Unhandled 'error' event" en el pool
db.on('error', (err) => {
  console.error('MySQL pool error (caught in db.js):', err);
});

// Exportamos el pool
export default db;
