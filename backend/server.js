const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection and initialization
const initApp = async () => {
  try {
    // Test connection
    await testConnection();
    
    // Import models to register them
    require('./models');
    
    // Skip sync since we're using existing database schema
    console.log('✅ Database models loaded successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize the app
initApp();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/verifications', require('./routes/verifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Tech Cycle API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

