const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Verification = sequelize.define('Verification', {
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
  userEmail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'user_email',
    validate: {
      isEmail: true
    }
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number'
  },
  idType: {
    type: DataTypes.ENUM('Driver\'s License', 'Passport', 'National ID', 'SSS ID', 'PhilHealth ID', 'TIN ID', 'Voter\'s ID', 'Postal ID'),
    allowNull: false,
    field: 'id_type'
  },
  idNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'id_number'
  },
  idImage: {
    type: DataTypes.TEXT, // Base64 encoded image
    allowNull: false,
    field: 'id_image'
  },
  selfieImage: {
    type: DataTypes.TEXT, // Base64 encoded image
    allowNull: false,
    field: 'selfie_image'
  },
  proofOfOwnership: {
    type: DataTypes.TEXT, // Base64 encoded image (optional)
    allowNull: true,
    field: 'proof_of_ownership'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  verificationId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'verification_id'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
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
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  }
}, {
  tableName: 'seller_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['verification_id']
    }
  ]
});

module.exports = Verification;