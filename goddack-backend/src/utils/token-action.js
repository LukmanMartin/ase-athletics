const jwt = require("jsonwebtoken");

// Función para generar un token pasándole el id y el role del usuario
const generateToken = (id, role, name) => {
    return jwt.sign({ id, role, name }, process.env.JWT_SECRET, {
        expiresIn: "8h",
    });
};
// Exportamos la función para usarla en authController
module.exports = { generateToken };