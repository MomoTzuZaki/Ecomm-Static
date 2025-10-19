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
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sellerAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending_payment', 'paid', 'admin_verification', 'completed', 'cancelled', 'refunded'),
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
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'verified_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'shipping_address'
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tracking_number'
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
      fields: ['product_id']
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
Transaction.prototype.calculateCommission = function(amount, commissionRate = 0.03) {
  this.commission = Math.round(amount * commissionRate * 100) / 100;
  this.sellerAmount = Math.round((amount - this.commission) * 100) / 100;
  return this;
};

Transaction.prototype.isPending = function() {
  return ['pending_payment', 'paid', 'admin_verification'].includes(this.status);
};

Transaction.prototype.canBeCancelled = function() {
  return ['pending_payment', 'paid'].includes(this.status);
};

Transaction.prototype.canBeRefunded = function() {
  return ['completed'].includes(this.status);
};

module.exports = Transaction;