const { sequelize } = require('../database-setup');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing Tech Cycle database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await sequelize.query(schema);
    
    console.log('✅ Database schema created successfully!');
    console.log('📊 Tables created:');
    console.log('   - users (buyers, sellers, admins)');
    console.log('   - seller_verifications (verification applications)');
    console.log('   - categories (product categories)');
    console.log('   - products (gadget listings)');
    console.log('   - cart (shopping cart)');
    console.log('   - transactions (purchase transactions)');
    console.log('   - payments (payment tracking)');
    console.log('   - shipping (delivery tracking)');
    console.log('   - messages (chat system)');
    console.log('   - reports (user reports)');
    console.log('   - reviews (seller ratings)');
    console.log('   - favorites (user favorites)');
    console.log('   - platform_earnings (profit tracking)');
    console.log('   - premium_listings (featured listings)');
    console.log('');
    console.log('🎯 Default categories inserted:');
    console.log('   - Smartphones, Laptops, Tablets, Audio');
    console.log('   - Cameras, Accessories, Gaming, Wearables');
    console.log('');
    console.log('🔧 Indexes and triggers created for optimal performance');
    console.log('💰 Ready for Tech Cycle C2C marketplace!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
