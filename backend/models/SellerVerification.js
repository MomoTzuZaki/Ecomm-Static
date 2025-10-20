const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SellerVerification = sequelize.define('SellerVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  validIdType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'valid_id_type'
  },
  idNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'id_number'
  },
  idImage: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'id_image'
  },
  selfieImage: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'selfie_image'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  proofOfOwnership: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'proof_of_ownership'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reviewed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  }
}, {
  tableName: 'seller_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SellerVerification;
