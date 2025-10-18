const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'buyer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'seller_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  transactionFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'transaction_fee',
    validate: {
      min: 0
    }
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'net_amount',
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending_payment', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'),
    defaultValue: 'pending_payment'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'payment_reference'
  },
  paymentProof: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'payment_proof'
  },
  paymentVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'payment_verified'
  },
  paymentVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'payment_verified_at'
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'shipping_address'
  },
  shippingMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'shipping_method'
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_cost',
    validate: {
      min: 0
    }
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tracking_number'
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shipped_at'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['buyer_id']
    },
    {
      fields: ['seller_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
Transaction.prototype.calculateTransactionFee = function(percentage = 0.05) {
  this.transactionFee = this.amount * percentage;
  this.netAmount = this.amount - this.transactionFee;
  return this;
};

Transaction.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Transaction.prototype.isPaid = function() {
  return this.status === 'paid' || this.status === 'shipped' || this.status === 'delivered' || this.status === 'completed';
};

Transaction.prototype.canBeCancelled = function() {
  return this.status === 'pending_payment' || this.status === 'paid';
};

module.exports = Transaction;
