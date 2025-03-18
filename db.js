const pgp = require("pg-promise")();

// Configuración de la base de datos
const db = pgp({
    host: "localhost",
    port: 5432,
    database: "mi_base_de_datos",
    user: "mi_usuario",
    password: "mi_contraseña"
});

module.exports = db;
