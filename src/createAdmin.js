import bcrypt from "bcryptjs";
import db from "./db.js"; 

const crearAdmin = async () => {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    const nuevoAdmin = {
      MailUsuario: "admin@fissio.com",
      PasswordUsuario: passwordHash,
      idRol: 1, 
      IsActive: 1
    };

    const query = `
      INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol, IsActive)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(query, [
      nuevoAdmin.MailUsuario,
      nuevoAdmin.PasswordUsuario,
      nuevoAdmin.idRol,
      nuevoAdmin.IsActive
    ]);

    console.log("✅ Usuario administrador creado correctamente.");
    process.exit();
  } catch (error) {
    console.error("❌ Error al crear el admin:", error);
    process.exit(1);
  }
};

crearAdmin();