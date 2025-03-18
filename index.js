const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const port = 3000; // Puedes cambiar el puerto si es necesario

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL con datos de Railway
const pool = new Pool({
  user: "postgres",
  host: "trolley.proxy.rlwy.net", // Aquí solo va el host, sin el puerto
  database: "railway",
  password: "nXxPGIcOvErphOSqJURyOASvJZVyHPho",
  port: 54772, // Aquí va el puerto separado
  ssl: { rejectUnauthorized: false }, // Importante para Railway
});

// Probar conexión a la base de datos
pool.connect()
  .then(() => console.log("🔗 Conectado a PostgreSQL"))
  .catch(err => console.error("❌ Error al conectar con la BD:", err));

// 📌 Registrar usuario
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "✅ Usuario registrado", user: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 Login de usuario
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // No incluimos la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ message: "✅ Login exitoso", user: userWithoutPassword });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
