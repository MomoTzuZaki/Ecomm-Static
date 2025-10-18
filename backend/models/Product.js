const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Smartphones', 'Laptops', 'Audio', 'Cameras', 'Tablets', 'Accessories'],
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  // Technical specifications
  specifications: {
    storage: String,
    color: String,
    screenSize: String,
    operatingSystem: String,
    batteryHealth: String,
    network: String,
    camera: String,
    material: String,
    dimensions: String,
    weight: String,
    warranty: String,
    accessories: String,
    // Custom specifications
    custom: mongoose.Schema.Types.Mixed,
  },
  images: [{
    type: String, // Base64 encoded images or URLs
  }],
  highlights: [{
    type: String,
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'inactive'],
    default: 'pending',
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, condition: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1, isPremium: 1 });

module.exports = mongoose.model('Product', productSchema);