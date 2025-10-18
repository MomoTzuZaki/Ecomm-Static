const express = require('express');
const { Cart, Product, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'username', 'sellerRating']
            }
          ]
        }
      ]
    });

    res.json({ items: cartItems });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (product.status !== 'approved') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check if item already exists in cart
    const existingItem = await Cart.findOne({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    if (existingItem) {
      // Update quantity
      await existingItem.update({ quantity: existingItem.quantity + quantity });
      return res.json({
        message: 'Item quantity updated in cart',
        item: existingItem
      });
    }

    // Add new item
    const cartItem = await Cart.create({
      userId: req.userId,
      productId: productId,
      quantity: quantity
    });

    res.json({
      message: 'Item added to cart successfully',
      item: cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const cartItem = await Cart.findOne({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cartItem.update({ quantity });

    res.json({
      message: 'Cart item updated successfully',
      item: cartItem
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const cartItem = await Cart.findOne({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cartItem.destroy();

    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear entire cart
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.destroy({
      where: { userId: req.userId }
    });

    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart item count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Cart.count({
      where: { userId: req.userId }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;