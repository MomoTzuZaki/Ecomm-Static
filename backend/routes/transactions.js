const express = require('express');
const { Op } = require('sequelize');
const { Transaction, Payment, User, Product } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new transaction (buyer initiates purchase)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, shippingAddress, paymentMethod } = req.body;
    const buyerId = req.userId;

    // Get product details
    const product = await Product.findByPk(productId, {
      include: [{ model: User, as: 'seller' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId === buyerId) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }

    if (product.status !== 'approved') {
      return res.status(400).json({ message: 'Product is not available for purchase' });
    }

    // Create transaction with commission calculation
    const transaction = await Transaction.create({
      buyerId,
      sellerId: product.sellerId,
      productId,
      amount: product.price,
      status: 'pending_payment',
      shippingAddress,
      paymentMethod
    });

    // Calculate commission (3%)
    transaction.calculateCommission(product.price, 0.03);
    await transaction.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        commission: transaction.commission,
        sellerAmount: transaction.sellerAmount,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Server error during transaction creation' });
  }
});

// Process payment for a transaction
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentMethod, paymentReference, paymentDetails } = req.body;
    const transactionId = req.params.id;
    const buyerId = req.userId;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Product, as: 'product' }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.buyerId !== buyerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (transaction.status !== 'pending_payment') {
      return res.status(400).json({ message: 'Transaction is not in pending payment status' });
    }

    // Create payment record
    const payment = await Payment.create({
      transactionId,
      amount: transaction.amount,
      paymentMethod,
      paymentReference,
      paymentDetails,
      status: 'processing'
    });

    // Simulate payment processing (in real app, integrate with payment gateway)
    setTimeout(async () => {
      try {
        await payment.update({ 
          status: 'completed',
          processedAt: new Date()
        });

        await transaction.update({ 
          status: 'admin_verification',
          paymentReference: paymentReference
        });
      } catch (error) {
        console.error('Payment processing error:', error);
        await payment.update({ 
          status: 'failed',
          failureReason: 'Payment processing failed'
        });
      }
    }, 2000);

    res.json({
      message: 'Payment initiated successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error during payment processing' });
  }
});

// Get user's transactions
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.query; // 'buyer' or 'seller'

    let whereClause = {};
    if (type === 'buyer') {
      whereClause.buyerId = userId;
    } else if (type === 'seller') {
      whereClause.sellerId = userId;
    } else {
      whereClause = {
        [Op.or]: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      };
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'seller', attributes: ['id', 'username', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'title', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction details
router.get('/:id', auth, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.userId;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'seller', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
        { model: Product, as: 'product' },
        { model: Payment, as: 'payments' }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is involved in this transaction or is admin
    if (transaction.buyerId !== userId && transaction.sellerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all transactions for verification
router.get('/admin/pending-verification', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const transactions = await Transaction.findAll({
      where: { status: 'admin_verification' },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'seller', attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
        { model: Product, as: 'product' },
        { model: Payment, as: 'payments' }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Verify and complete transaction
router.put('/:id/verify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { adminNotes, trackingNumber } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: Product, as: 'product' }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'admin_verification') {
      return res.status(400).json({ message: 'Transaction is not pending verification' });
    }

    // Update transaction status
    await transaction.update({
      status: 'completed',
      adminNotes,
      trackingNumber,
      verifiedAt: new Date(),
      verifiedBy: req.userId,
      completedAt: new Date()
    });

    // Update product status to sold
    await transaction.product.update({ status: 'sold' });

    res.json({
      message: 'Transaction verified and completed successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Cancel transaction
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const transactionId = req.params.id;
    const userId = req.userId;

    const transaction = await Transaction.findByPk(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user can cancel this transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!transaction.canBeCancelled()) {
      return res.status(400).json({ message: 'Transaction cannot be cancelled' });
    }

    await transaction.update({
      status: 'cancelled',
      adminNotes: reason || 'Transaction cancelled by user'
    });

    res.json({
      message: 'Transaction cancelled successfully',
      transaction
    });
  } catch (error) {
    console.error('Transaction cancellation error:', error);
    res.status(500).json({ message: 'Server error during cancellation' });
  }
});

module.exports = router;
