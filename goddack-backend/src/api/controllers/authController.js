const User = require('../models/User');
const { generateToken } = require("../../utils/token-action");
const { setError } = require("../../utils/error");

// Registro de Usuario
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ code: 400, message: "El email ya está registrado" });
        }

        user = new User({ name, email, password, role: role || 'scout' });
        await user.save();

        res.status(201).json({ 
            message: "Usuario creado correctamente",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ code: 500, message: error.message || "Error en el servidor al registrar" });
    }
};

// Login de Usuario
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(setError(400, "Credenciales inválidas (Email no encontrado)"));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json(setError(400, "Credenciales inválidas (Contraseña incorrecta)"));
        }

        // FIX: añadimos user.name al token
        const token = generateToken(user._id, user.role, user.name);

        res.status(200).json({ 
            token, 
            user: { 
                id:   user._id, 
                name: user.name, 
                role: user.role 
            } 
        });

    } catch (error) {
        res.status(500).json(setError(500, error.message || "Error en el servidor al iniciar sesión"));
    }
};