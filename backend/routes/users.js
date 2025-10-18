const express = require('express');
const { User, Product } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's products
router.get('/:id/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        sellerId: req.params.id,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'email', 'sellerRating', 'totalSales']
        }
      ]
    });

    res.json(products);
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (own profile or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, role } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.params.id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = { firstName, lastName, phone, address };
    
    // Only admin can change role
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow admin to delete themselves
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics (admin only)
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalProducts = await Product.count();
    const approvedProducts = await Product.count({ where: { status: 'approved' } });
    const pendingProducts = await Product.count({ where: { status: 'pending' } });

    res.json({
      totalUsers,
      totalAdmins,
      totalProducts,
      approvedProducts,
      pendingProducts
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;