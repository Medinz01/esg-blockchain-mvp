const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, requireRole  } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/update', authMiddleware, authController.updateProfile);

// Admin only - Promote user to verifier
router.put('/promote-verifier/:userId', 
  authMiddleware, 
  requireRole('admin'), 
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      user.role = 'verifier';
      await user.save();
      
      res.json({ 
        success: true, 
        message: 'User promoted to verifier',
        user 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


module.exports = router;
