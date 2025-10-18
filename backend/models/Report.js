const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'reporter_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reportedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reported_user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reportedProductId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reported_product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  screenshot: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'resolved_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Report;
