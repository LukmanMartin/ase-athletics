const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const auth = require('../../middlewares/auth.js'); 
const adminAuth = require('../../middlewares/roleAuth.js');
const { validatePlayer } = require('../../middlewares/validator'); // Importamos el validador

// --- RUTAS PÚBLICAS ---
// IMPORTANTE: /search SIEMPRE antes de /:id
router.get('/search', playerController.searchPlayers);
router.get('/', playerController.getPlayers);
router.get('/:id', playerController.getPlayerById);

// --- RUTAS PROTEGIDAS (Requieren Token) ---
// Validamos los datos antes de crear
router.post('/', auth, validatePlayer, playerController.createPlayer); 

// --- RUTAS SOLO ADMIN ---
// Doble protección + Validación de datos
router.put('/:id', auth, validatePlayer, playerController.updatePlayer);
router.delete('/:id', auth, playerController.deletePlayer);

module.exports = router;