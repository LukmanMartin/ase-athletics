const Joi = require('joi');

// Esquema de validación para Jugadores
const playerValidationSchema = Joi.object({
    id:          Joi.number(),                  // opcional, lo puede generar el backend
    name:        Joi.string().min(2).required(),
    position:    Joi.string().required(),
    age:         Joi.number().min(14).max(50),
    team:        Joi.string().allow('', null),
    nationality: Joi.string().allow('', null),
    image:       Joi.string().allow('', null),
    marketValue: Joi.string().allow('', null),
    contractUntil: Joi.string().allow('', null),
    stats:       Joi.object().unknown(true),
    attributes:  Joi.object().unknown(true)
}).unknown(true);

const validatePlayer = (req, res, next) => {
    const { error } = playerValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            message: "Error de validación", 
            error: error.details[0].message 
        });
    }
    next();
};

module.exports = { validatePlayer };