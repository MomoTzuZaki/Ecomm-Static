const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Product = require('./Product');
const Cart = require('./Cart');
const Category = require('./Category');
const Favorite = require('./Favorite');
const Message = require('./Message');
const PlatformEarning = require('./PlatformEarning');
const Report = require('./Report');
const Review = require('./Review');
const SellerVerification = require('./SellerVerification');
const Transaction = require('./Transaction');
const Payment = require('./Payment');
const Verification = require('./Verification');

// Define associations
// User associations
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportedUser' });
User.hasMany(Review, { foreignKey: 'buyerId', as: 'buyerReviews' });
User.hasMany(Review, { foreignKey: 'sellerId', as: 'sellerReviews' });
User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'buyerTransactions' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sellerTransactions' });
User.hasOne(SellerVerification, { foreignKey: 'userId', as: 'verification' });
User.hasOne(Verification, { foreignKey: 'userId', as: 'userVerification' });

// Product associations
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartItems' });
Product.hasMany(Favorite, { foreignKey: 'productId', as: 'favorites' });
Product.hasMany(Message, { foreignKey: 'productId', as: 'messages' });
Product.hasMany(Report, { foreignKey: 'reportedProductId', as: 'reports' });
Product.hasMany(Transaction, { foreignKey: 'productId', as: 'transactions' });

// Category associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
Message.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Transaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Transaction.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
Transaction.hasMany(PlatformEarning, { foreignKey: 'transactionId', as: 'earnings' });
Transaction.hasMany(Review, { foreignKey: 'transactionId', as: 'reviews' });
Transaction.hasMany(Payment, { foreignKey: 'transactionId', as: 'payments' });

// Review associations
Review.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Review.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Review.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Report associations
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
Report.belongsTo(Product, { foreignKey: 'reportedProductId', as: 'reportedProduct' });
Report.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

// SellerVerification associations
SellerVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SellerVerification.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Verification associations
Verification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Verification.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// PlatformEarning associations
PlatformEarning.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Payment associations
Payment.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Product,
  Cart,
  Category,
  Favorite,
  Message,
  PlatformEarning,
  Report,
  Review,
  SellerVerification,
  Transaction,
  Payment,
  Verification
};
