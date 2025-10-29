const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Protected routes - Verifiers and Admins only
router.get('/pending', 
  authMiddleware, 
  requireRole('verifier', 'admin'), 
  verificationController.getPendingRecords
);

router.get('/all', 
  authMiddleware, 
  requireRole('verifier', 'admin'), 
  verificationController.getAllRecords
);

router.post('/verify/:recordId', 
  authMiddleware, 
  requireRole('verifier', 'admin'), 
  verificationController.verifyRecord
);

router.get('/stats', 
  authMiddleware, 
  verificationController.getVerificationStats
);

module.exports = router;
