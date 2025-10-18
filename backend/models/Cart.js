const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalPrice = this.items.reduce((total, item) => {
    return total + item.product.price;
  }, 0);
  next();
});

// Populate product details when retrieving cart
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'title price images seller'
  });
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
