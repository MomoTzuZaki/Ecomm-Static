const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'seller', 'admin'),
    defaultValue: 'user'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  verificationStatus: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
    field: 'verification_status'
  },
  verificationId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'verification_id'
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  businessName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_name'
  },
  businessDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'business_description'
  },
  sellerRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    field: 'seller_rating'
  },
  totalSales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_sales'
  },
  responseRate: {
    type: DataTypes.STRING(10),
    defaultValue: '0%',
    field: 'response_rate'
  },
  responseTime: {
    type: DataTypes.STRING(20),
    defaultValue: 'N/A',
    field: 'response_time'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
};

User.prototype.isSeller = function() {
  return this.role === 'seller' && this.verificationStatus === 'approved';
};

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

module.exports = User;