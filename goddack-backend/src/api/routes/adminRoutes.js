const express    = require('express');
const router     = express.Router();
const auth      = require('../../middlewares/auth');
const adminAuth = require('../../middlewares/roleAuth');
const userCtrl   = require('../controllers/userController');

// Todas las rutas requieren auth + adminAuth
router.get('/',              auth, adminAuth, userCtrl.getUsers);
router.get('/stats',         auth, adminAuth, userCtrl.getAdminStats);
router.delete('/:id',        auth, adminAuth, userCtrl.deleteUser);
router.put('/:id/role',      auth, adminAuth, userCtrl.updateRole);

module.exports = router;