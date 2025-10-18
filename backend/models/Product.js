const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'original_price',
    validate: {
      min: 0
    }
  },
  condition: {
    type: DataTypes.ENUM('Excellent', 'Good', 'Fair', 'Poor'),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  highlights: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'sold', 'inactive'),
    defaultValue: 'pending'
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  premiumExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'premium_expires_at'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favoritesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'favorites_count'
  },
  datePosted: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_posted'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_premium']
    },
    {
      fields: ['price']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
Product.prototype.incrementViews = function() {
  this.views += 1;
  return this.save();
};

Product.prototype.isAvailable = function() {
  return this.status === 'approved';
};

Product.prototype.isPremiumActive = function() {
  return this.isPremium && this.premiumExpiresAt && new Date() < this.premiumExpiresAt;
};

Product.prototype.getDiscountPercentage = function() {
  if (this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
};

module.exports = Product;