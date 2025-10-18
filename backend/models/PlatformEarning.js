const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlatformEarning = sequelize.define('PlatformEarning', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  transactionFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'transaction_fee',
    validate: {
      min: 0
    }
  },
  premiumListingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'premium_listing_fee',
    validate: {
      min: 0
    }
  },
  shippingCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_commission',
    validate: {
      min: 0
    }
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_earnings',
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'platform_earnings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PlatformEarning;
