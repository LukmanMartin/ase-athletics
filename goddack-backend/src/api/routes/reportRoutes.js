const express = require('express');
const router  = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../../middlewares/auth.js');

router.get('/',                 auth, reportController.getReports);
router.get('/:id',              auth, reportController.getReportById);
router.get('/player/:playerId', auth, reportController.getReportsByPlayer);
router.post('/',                auth, reportController.createReport);

// Editar y borrar — el controller verifica que sea el dueño o admin
router.put('/:id',              auth, reportController.updateReport);
router.delete('/:id',           auth, reportController.deleteReport);

module.exports = router;