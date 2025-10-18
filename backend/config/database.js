const { Sequelize } = require('sequelize');
require('dotenv').config();

// Parse the connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_di9DeS2jalnh@ep-weathered-resonance-ad8lbbcr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create Sequelize instance
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Neon PostgreSQL database successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
