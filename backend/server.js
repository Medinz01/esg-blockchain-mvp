require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const blockchainRoutes = require('./routes/blockchain');
const esgRoutes = require('./routes/esg');
const verificationRoutes = require('./routes/verification');


const app = express();


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

  
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/esg', esgRoutes);
app.use('/api/verification', verificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    blockchain: process.env.BLOCKCHAIN_RPC,
    contract: process.env.CONTRACT_ADDRESS
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ESG Blockchain MVP API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI.split('@')[1]}`);
  console.log(`⛓️  Blockchain: ${process.env.BLOCKCHAIN_RPC}`);
  console.log(`📝 Contract: ${process.env.CONTRACT_ADDRESS}`);
});
