const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'gcash', 'paymaya', 'paypal', 'other'),
    allowNull: false,
    field: 'payment_method'
  },
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'payment_reference'
  },
  paymentProvider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_provider'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paymentDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'payment_details'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'failure_reason'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['transaction_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_method']
    }
  ]
});

// Instance methods
Payment.prototype.isSuccessful = function() {
  return this.status === 'completed';
};

Payment.prototype.isPending = function() {
  return ['pending', 'processing'].includes(this.status);
};

Payment.prototype.canBeRefunded = function() {
  return this.status === 'completed';
};

module.exports = Payment;
