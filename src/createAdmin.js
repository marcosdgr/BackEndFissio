import bcrypt from "bcryptjs";
import db from "./Config/db.js"; 

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
      UPDATE usuarios 
      SET PasswordUsuario = ?, idRol = ?, IsActive = ?
      WHERE MailUsuario = ?
    `;

    db.query(query, [
      nuevoAdmin.PasswordUsuario,
      nuevoAdmin.idRol,
      nuevoAdmin.IsActive,
      nuevoAdmin.MailUsuario
    ], (error, results) => {
      if (error) {
        console.error("❌ Error al actualizar el admin:", error);
        process.exit(1);
      }
      
      if (results.affectedRows === 0) {
        console.log("⚠️ No se encontró el usuario, creando uno nuevo...");
        
        const insertQuery = `
          INSERT INTO usuarios (MailUsuario, PasswordUsuario, idRol, IsActive)
          VALUES (?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [
          nuevoAdmin.MailUsuario,
          nuevoAdmin.PasswordUsuario,
          nuevoAdmin.idRol,
          nuevoAdmin.IsActive
        ], (insertError) => {
          if (insertError) {
            console.error("❌ Error al crear el admin:", insertError);
            process.exit(1);
          }
          console.log("✅ Usuario administrador creado correctamente.");
          process.exit(0);
        });
      } else {
        console.log("✅ Contraseña del administrador actualizada correctamente.");
        process.exit(0);
      }
    });
  } catch (error) {
    console.error("❌ Error al crear el admin:", error);
    process.exit(1);
  }
};

crearAdmin();