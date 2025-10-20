const express = require('express');
const { SellerVerification, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submit verification request
router.post('/', auth, async (req, res) => {
  try {
    const {
      address,
      phoneNumber,
      idType,
      idNumber,
      idImage,
      selfieImage,
      proofOfOwnership
    } = req.body;

    // Check if user already has a pending verification
    const existingVerification = await SellerVerification.findOne({
      where: {
        userId: req.userId,
        status: 'pending'
      }
    });

    if (existingVerification) {
      return res.status(400).json({
        message: 'You already have a pending verification request'
      });
    }

    // Generate unique verification ID
    const verificationId = `VER-${Date.now()}`;

    // Create verification request
    const verification = await SellerVerification.create({
      userId: req.userId,
      validIdType: idType,
      idNumber: idNumber,
      idImage,
      selfieImage,
      address,
      proofOfOwnership,
      status: 'pending'
    });

    // Update user's verification status
    await User.update({
      verificationStatus: 'pending',
    }, {
      where: { id: req.userId }
    });

    res.status(201).json({
      message: 'Verification request submitted successfully',
      verificationId: verification.id,
      verification: verification,
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ message: 'Server error during verification submission' });
  }
});

// Get user's verification status
router.get('/my-status', auth, async (req, res) => {
  try {
    const verification = await SellerVerification.findOne({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

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

    const verifications = await SellerVerification.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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

    const verification = await SellerVerification.findByPk(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification
    await verification.update({
      status: status,
      reviewedAt: new Date(),
      reviewedBy: req.userId,
      adminNotes: rejectionReason || null
    });

    // Update user's role and verification status
    if (status === 'approved') {
      await User.update({
        role: 'seller',
        isVerified: true,
        verificationStatus: 'approved',
      }, {
        where: { id: verification.userId }
      });
    } else if (status === 'rejected') {
      await User.update({
        verificationStatus: 'rejected',
      }, {
        where: { id: verification.userId }
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