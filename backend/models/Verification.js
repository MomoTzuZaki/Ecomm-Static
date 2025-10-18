const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  idType: {
    type: String,
    required: true,
    enum: ['Driver\'s License', 'Passport', 'National ID', 'SSS ID', 'PhilHealth ID', 'TIN ID', 'Voter\'s ID', 'Postal ID'],
  },
  idNumber: {
    type: String,
    required: true,
  },
  idImage: {
    type: String, // Base64 encoded image
    required: true,
  },
  selfieImage: {
    type: String, // Base64 encoded image
    required: true,
  },
  proofOfOwnership: {
    type: String, // Base64 encoded image (optional)
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationId: {
    type: String,
    required: true,
    unique: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for better query performance
verificationSchema.index({ userId: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ verificationId: 1 });

module.exports = mongoose.model('Verification', verificationSchema);
