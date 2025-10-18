const { User } = require('./models');
const bcrypt = require('bcryptjs');

const seedAccounts = async () => {
  try {
    console.log('🌱 Seeding existing accounts to PostgreSQL database...');
    
    // Default accounts from the frontend
    const defaultAccounts = [
      {
        username: 'admin',
        email: 'admin@techcycle.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'approved',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1-555-0100',
        address: 'Tech Cycle Headquarters, Admin Office',
        businessName: 'Tech Cycle Admin',
        businessDescription: 'Platform Administrator',
        sellerRating: 5.00,
        totalSales: 0,
        responseRate: '100%',
        responseTime: '< 1 hour'
      },
      {
        username: 'user',
        email: 'user@techcycle.com',
        password: 'password',
        role: 'user',
        isVerified: true,
        verificationStatus: 'approved',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        address: '123 Main Street, City, State 12345',
        sellerRating: 0.00,
        totalSales: 0,
        responseRate: '0%',
        responseTime: 'N/A'
      },
      {
        username: 'seller1',
        email: 'seller1@techcycle.com',
        password: 'seller123',
        role: 'seller',
        isVerified: true,
        verificationStatus: 'approved',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0102',
        address: '456 Tech Avenue, Gadget City, State 54321',
        businessName: 'Jane\'s Tech Store',
        businessDescription: 'Specializing in premium electronics and gadgets',
        sellerRating: 4.8,
        totalSales: 25,
        responseRate: '95%',
        responseTime: '< 2 hours'
      },
      {
        username: 'seller2',
        email: 'seller2@techcycle.com',
        password: 'seller123',
        role: 'seller',
        isVerified: true,
        verificationStatus: 'approved',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1-555-0103',
        address: '789 Electronics Blvd, Tech Town, State 98765',
        businessName: 'Mike\'s Electronics',
        businessDescription: 'Quality used electronics at great prices',
        sellerRating: 4.5,
        totalSales: 18,
        responseRate: '90%',
        responseTime: '< 3 hours'
      },
      {
        username: 'buyer1',
        email: 'buyer1@techcycle.com',
        password: 'buyer123',
        role: 'user',
        isVerified: true,
        verificationStatus: 'approved',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '+1-555-0104',
        address: '321 Consumer Street, Shopping District, State 11111',
        sellerRating: 0.00,
        totalSales: 0,
        responseRate: '0%',
        responseTime: 'N/A'
      }
    ];

    // Check if accounts already exist
    for (const accountData of defaultAccounts) {
      const existingUser = await User.findOne({
        where: {
          email: accountData.email
        }
      });

      if (existingUser) {
        console.log(`⚠️  Account ${accountData.email} already exists, skipping...`);
        continue;
      }

      // Create the account
      const user = await User.create(accountData);
      console.log(`✅ Created account: ${user.email} (${user.role})`);
    }

    console.log('🎉 Account seeding completed successfully!');
    console.log('');
    console.log('📋 Default Accounts Created:');
    console.log('   👑 Admin: admin@techcycle.com / admin123');
    console.log('   👤 User: user@techcycle.com / password');
    console.log('   🛍️  Seller 1: seller1@techcycle.com / seller123');
    console.log('   🛍️  Seller 2: seller2@techcycle.com / seller123');
    console.log('   🛒 Buyer: buyer1@techcycle.com / buyer123');
    console.log('');
    console.log('🔐 All passwords are hashed and secure');
    
  } catch (error) {
    console.error('❌ Error seeding accounts:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedAccounts()
    .then(() => {
      console.log('🎉 Account seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Account seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAccounts };
