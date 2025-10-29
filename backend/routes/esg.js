const express = require('express');
const router = express.Router();
const esgController = require('../controllers/esgController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.post('/submit', authMiddleware, esgController.submitESGData);
router.get('/records', authMiddleware, esgController.getCompanyRecords);
router.get('/record/:recordId', authMiddleware, esgController.getRecordById);
router.get('/data-types', authMiddleware, esgController.getDataTypes);

module.exports = router;
