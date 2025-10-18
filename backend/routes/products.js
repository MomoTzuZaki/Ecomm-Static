const express = require('express');
const { Op } = require('sequelize');
const { Product, User, Category } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sortBy = 'datePosted',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = { status: 'approved' };

    if (category) where.categoryId = category;
    if (condition) where.condition = condition;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build order clause
    const order = [];
    if (sortBy === 'datePosted') {
      order.push(['datePosted', sortOrder.toUpperCase()]);
    } else if (sortBy === 'price') {
      order.push(['price', sortOrder.toUpperCase()]);
    } else {
      order.push(['createdAt', sortOrder.toUpperCase()]);
    }

    // Execute query with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'isVerified', 'sellerRating']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalProducts: count,
        hasNext: offset + products.length < count,
        hasPrev: parseInt(page) > 1,
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'email', 'isVerified', 'sellerRating']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await product.incrementViews();

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (seller only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only verified sellers can list products' });
    }

    const productData = {
      ...req.body,
      sellerId: req.userId,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product or is admin
    if (product.sellerId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProduct = await product.update(req.body);

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product or is admin
    if (product.sellerId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's products
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is accessing their own products or is admin
    if (userId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await Product.findAll({
      where: { sellerId: userId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'email', 'isVerified']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ products });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;