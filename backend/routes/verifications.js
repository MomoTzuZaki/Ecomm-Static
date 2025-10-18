const express = require('express');
const Verification = require('../models/Verification');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit verification request
router.post('/', auth, async (req, res) => {
  try {
    const {
      fullName,
      address,
      phoneNumber,
      idType,
      idNumber,
      idImage,
      selfieImage,
      proofOfOwnership
    } = req.body;

    // Check if user already has a pending verification
    const existingVerification = await Verification.findOne({
      userId: req.userId,
      status: 'pending'
    });

    if (existingVerification) {
      return res.status(400).json({
        message: 'You already have a pending verification request'
      });
    }

    // Generate unique verification ID
    const verificationId = `VER-${Date.now()}`;

    // Create verification request
    const verification = new Verification({
      userId: req.userId,
      userEmail: req.user.email,
      fullName,
      address,
      phoneNumber,
      idType,
      idNumber,
      idImage,
      selfieImage,
      proofOfOwnership,
      verificationId,
    });

    await verification.save();

    // Update user's verification status
    await User.findByIdAndUpdate(req.userId, {
      verificationStatus: 'pending',
      verificationId: verificationId,
    });

    res.status(201).json({
      message: 'Verification request submitted successfully',
      verificationId: verificationId,
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ message: 'Server error during verification submission' });
  }
});

// Get user's verification status
router.get('/my-status', auth, async (req, res) => {
  try {
    const verification = await Verification.findOne({ userId: req.userId })
      .sort({ createdAt: -1 });

    if (!verification) {
      return res.json({ verification: null });
    }

    res.json({ verification });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all verifications (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const verifications = await Verification.find()
      .populate('userId', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ verifications });
  } catch (error) {
    console.error('Get all verifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update verification status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, rejectionReason } = req.body;
    const verificationId = req.params.id;

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification
    verification.status = status;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.userId;
    if (rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }

    await verification.save();

    // Update user's role and verification status
    if (status === 'approved') {
      await User.findByIdAndUpdate(verification.userId, {
        role: 'seller',
        isVerified: true,
        verificationStatus: 'approved',
      });
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(verification.userId, {
        verificationStatus: 'rejected',
      });
    }

    res.json({
      message: `Verification ${status} successfully`,
      verification,
    });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
