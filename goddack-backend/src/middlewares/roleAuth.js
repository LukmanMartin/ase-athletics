const adminAuth = (req, res, next) => {
    // El middleware 'auth' ya puso los datos del usuario en req.user
    if (req.user && req.user.role === 'admin') {
        next(); // Es admin, puede pasar
    } else {
        res.status(403).json({ 
            message: "Acceso denegado: Se requieren permisos de administrador" 
        });
    }
};

module.exports = adminAuth;