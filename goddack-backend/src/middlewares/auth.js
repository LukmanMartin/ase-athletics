const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Buscamos el token en la cabecera 'Authorization'
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "No hay token, permiso denegado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Añadimos los datos del usuario a la petición
        next();
    } catch (error) {
        res.status(401).json({ message: "Token no válido" });
    }
};

module.exports = auth;