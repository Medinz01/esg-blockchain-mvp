const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Web3 } = require('web3');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, companyName, walletAddress, registrationId, role } = req.body;

    // Validate input
    if (!email || !password || !companyName || !walletAddress) {
      return res.status(400).json({ 
        error: 'Please provide all required fields' 
      });
    }

    // Validate wallet address format
    if (!Web3.utils.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { walletAddress }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Wallet address already registered'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      companyName,
      walletAddress: walletAddress.toLowerCase(),
      registrationId,
      role: role || 'company'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        walletAddress: user.walletAddress,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        walletAddress: user.walletAddress,
        role: user.role,
        isBlockchainRegistered: user.isBlockchainRegistered
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

// @route   PUT /api/auth/update
// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { companyName, registrationId } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (companyName) user.companyName = companyName;
    if (registrationId) user.registrationId = registrationId;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
