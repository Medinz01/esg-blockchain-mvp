const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.post('/register-company', authMiddleware, blockchainController.registerCompany);
router.get('/company-info', authMiddleware, blockchainController.getCompanyInfo);
router.get('/stats', authMiddleware, blockchainController.getBlockchainStats);

module.exports = router;
