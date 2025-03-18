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

// Ruta para registrar usuario
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
