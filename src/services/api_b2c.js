// B2C E-commerce API - TechCycle Second-Hand Devices Store
// This replaces the C2C marketplace with a B2C business model

// Storage configuration
const STORAGE_QUOTA_LIMIT = 10 * 1024 * 1024; // 10MB
const CLEANUP_THRESHOLD = 0.9; // 90% of quota
const MAX_ITEM_SIZE = 1024 * 1024; // 1MB per item

// Storage management functions
const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  return total;
};

const cleanupOldData = () => {
  try {
    // Clean up old transactions (keep last 100)
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length > 100) {
      const recentTransactions = transactions.slice(-100);
      localStorage.setItem('transactions', JSON.stringify(recentTransactions));
    }

    // Clean up old orders (keep last 200)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length > 200) {
      const recentOrders = orders.slice(-200);
      localStorage.setItem('orders', JSON.stringify(recentOrders));
    }
  } catch (error) {
    console.error('Storage cleanup failed:', error);
  }
};

const manageStorageQuota = () => {
  const usage = getStorageUsage();
  if (usage > STORAGE_QUOTA_LIMIT * CLEANUP_THRESHOLD) {
    cleanupOldData();
  }
};

// Safe localStorage setter with quota management
const safeSetItem = (key, value, skipSizeCheck = false) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  try {
    // Skip size check for small items
    if (!skipSizeCheck && stringValue.length > MAX_ITEM_SIZE) {
      throw new Error('Item too large for localStorage');
    }
    
    localStorage.setItem(key, stringValue);
    manageStorageQuota();
  } catch (error) {
    console.error(`Error storing to localStorage: ${key}`, error);
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      cleanupOldData();
      try {
        localStorage.setItem(key, stringValue);
      } catch (retryError) {
        console.error('Failed to store data even after cleanup:', retryError);
        throw new Error('Storage quota exceeded. Please clear browser data or use a different browser.');
      }
    } else {
      throw error;
    }
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        safeSetItem('techCycleUser', user, true);
        return { user };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const newUser = {
        id: `USER-${Date.now()}`,
        ...userData,
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      safeSetItem('users', users, true);
      safeSetItem('techCycleUser', newUser, true);

      return { user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('techCycleUser');
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('techCycleUser');
    return raw ? JSON.parse(raw) : null;
  },
};

// Product Management API
export const productAPI = {
  getAllProducts: async () => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      return { products };
    } catch (error) {
      console.error('Error getting products:', error);
      return { products: [] };
    }
  },

  getProductById: async (id) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const product = products.find(p => p.id === id);
      return { product };
    } catch (error) {
      console.error('Error getting product:', error);
      return { product: null };
    }
  },

  createProduct: async (productData) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: `PROD-${Date.now()}`,
        ...productData,
        isActive: true,
        // Removed stock field for second-hand store
        price: parseFloat(productData.price) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      products.push(newProduct);
      safeSetItem('products', products, true);
      
      return { product: newProduct };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const productIndex = products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        throw new Error('Product not found');
      }
      
      products[productIndex] = {
        ...products[productIndex],
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      safeSetItem('products', products, true);
      
      return { product: products[productIndex] };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const filteredProducts = products.filter(p => p.id !== id);
      
      safeSetItem('products', filteredProducts, true);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) return { cart: [] };

      const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      return { cart };
    } catch (error) {
      console.error('Error getting cart:', error);
      return { cart: [] };
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Please login to add items to cart');

      const { product } = await productAPI.getProductById(productId);
      if (!product) throw new Error('Product not found');

      const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      const existingItem = cart.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          id: `CART-${Date.now()}`,
          productId,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            // Removed stock field for second-hand store
          },
          addedAt: new Date().toISOString()
        });
      }

      safeSetItem(`cart_${user.id}`, cart, true);
      return { cart };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Please login');

      const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      const itemIndex = cart.findIndex(item => item.id === cartItemId);

      if (itemIndex === -1) throw new Error('Cart item not found');

      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }

      safeSetItem(`cart_${user.id}`, cart, true);
      return { cart };
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Please login');

      const cart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]');
      const filteredCart = cart.filter(item => item.id !== cartItemId);

      safeSetItem(`cart_${user.id}`, filteredCart, true);
      return { cart: filteredCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Please login');

      safeSetItem(`cart_${user.id}`, [], true);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

// Order Management API
export const orderAPI = {
  createOrder: async (orderData) => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Please login to place order');

      const { cart } = await cartAPI.getCart();
      if (cart.length === 0) throw new Error('Cart is empty');

      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shippingFee = orderData.shippingFee || 0;
      const techCycleCommission = Math.round(subtotal * 0.03); // 3% commission
      const total = subtotal + shippingFee + techCycleCommission;

      const order = {
        id: `ORDER-${Date.now()}`,
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        items: cart.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        subtotal,
        shippingFee,
        techCycleCommission,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        trackingNumber: null,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      safeSetItem('orders', orders, true);

      // Clear cart after successful order
      await cartAPI.clearCart();

      return { order };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user) return { orders: [] };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = orders.filter(order => order.userId === user.id);
      
      return { orders: userOrders };
    } catch (error) {
      console.error('Error getting orders:', error);
      return { orders: [] };
    }
  },

  getAllOrders: async () => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      return { orders };
    } catch (error) {
      console.error('Error getting all orders:', error);
      return { orders: [] };
    }
  },

  updateOrderStatus: async (orderId, status, notes = '') => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      
      if (notes) {
        orders[orderIndex].notes = notes;
      }

      safeSetItem('orders', orders, true);
      
      return { order: orders[orderIndex] };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

// Payment API
export const paymentAPI = {
  processPayment: async (orderId, paymentData) => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      // Simulate payment processing
      const payment = {
        id: `PAY-${Date.now()}`,
        orderId,
        amount: orders[orderIndex].total,
        method: paymentData.method,
        status: 'completed',
        reference: paymentData.reference || `REF-${Date.now()}`,
        processedAt: new Date().toISOString()
      };

      orders[orderIndex].paymentStatus = 'completed';
      orders[orderIndex].payment = payment;
      orders[orderIndex].updatedAt = new Date().toISOString();

      safeSetItem('orders', orders, true);

      return { payment };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
};

// Helper function to create admin user for testing
export const createAdminUser = () => {
  const adminUser = {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@techcycle.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    createdAt: new Date().toISOString()
  };
  
  safeSetItem('techCycleUser', adminUser, true);
  return adminUser;
};

// Helper function to create test user account
export const createTestUser = () => {
  const testUser = {
    id: 'user-001',
    username: 'testuser',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  };

  return testUser;
};

// Initialize sample data
export const initializeSampleData = () => {
  // Sample products - 20 items with various brands
  const sampleProducts = [
    {
      id: 'PROD-001',
      name: 'iPhone 13 Pro',
      description: 'Excellent condition iPhone 13 Pro with 256GB storage. Includes original charger and case.',
      price: 45000,
      originalPrice: 55000,
      category: 'Smartphones',
      brand: 'Apple',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Storage': '256GB',
        'Color': 'Graphite',
        'Battery Health': '95%',
        'Screen Size': '6.1"',
        'Camera': 'Triple 12MP',
        'Processor': 'A15 Bionic'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-002',
      name: 'MacBook Air M2',
      description: 'Like new MacBook Air with M2 chip. Perfect for work and productivity.',
      price: 65000,
      originalPrice: 75000,
      category: 'Laptops',
      brand: 'Apple',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Processor': 'Apple M2',
        'Memory': '8GB RAM',
        'Storage': '256GB SSD',
        'Display': '13.6" Liquid Retina',
        'Battery Life': 'Up to 18 hours',
        'Weight': '1.24 kg'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-003',
      name: 'Samsung Galaxy S22',
      description: 'Great condition Samsung Galaxy S22 with 128GB storage.',
      price: 35000,
      originalPrice: 42000,
      category: 'Smartphones',
      brand: 'Samsung',
      condition: 'Good',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Storage': '128GB',
        'Color': 'Phantom Black',
        'Battery': '3700mAh',
        'Screen Size': '6.1"',
        'Camera': 'Triple camera',
        'Processor': 'Snapdragon 8 Gen 1'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-004',
      name: 'Dell XPS 13',
      description: 'Premium Dell XPS 13 laptop in excellent condition. Perfect for professionals.',
      price: 55000,
      originalPrice: 65000,
      category: 'Laptops',
      brand: 'Dell',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Processor': 'Intel Core i7',
        'Memory': '16GB RAM',
        'Storage': '512GB SSD',
        'Display': '13.4" InfinityEdge',
        'Graphics': 'Intel Iris Xe',
        'Weight': '1.27 kg'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-005',
      name: 'iPad Pro 11-inch',
      description: 'Like new iPad Pro 11-inch with M1 chip. Great for creative work.',
      price: 40000,
      originalPrice: 48000,
      category: 'Tablets',
      brand: 'Apple',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Processor': 'Apple M1',
        'Storage': '256GB',
        'Display': '11" Liquid Retina',
        'Camera': '12MP Wide',
        'Battery Life': 'Up to 10 hours'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-006',
      name: 'OnePlus 10 Pro',
      description: 'Excellent condition OnePlus 10 Pro with 256GB storage.',
      price: 38000,
      originalPrice: 45000,
      category: 'Smartphones',
      brand: 'OnePlus',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Storage': '256GB',
        'Color': 'Volcanic Black',
        'Battery': '5000mAh',
        'Screen Size': '6.7"',
        'Camera': 'Triple camera',
        'Processor': 'Snapdragon 8 Gen 1'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-007',
      name: 'HP Pavilion 15',
      description: 'Good condition HP Pavilion 15 laptop. Reliable for everyday use.',
      price: 32000,
      originalPrice: 38000,
      category: 'Laptops',
      brand: 'HP',
      condition: 'Good',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: AMD Ryzen 5, Memory: 8GB RAM, Storage: 256GB SSD, Display: 15.6" FHD, Graphics: AMD Radeon Graphics, Weight: 1.75 kg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-008',
      name: 'Samsung Galaxy Tab S8',
      description: 'Premium Samsung Galaxy Tab S8 tablet in excellent condition.',
      price: 35000,
      originalPrice: 42000,
      category: 'Tablets',
      brand: 'Samsung',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: Snapdragon 8 Gen 1, Storage: 128GB, Display: 11" TFT LCD, Camera: 13MP + 6MP, Battery: 8000mAh, Weight: 507g',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-009',
      name: 'Sony WH-1000XM4',
      description: 'Premium noise-canceling headphones in excellent condition.',
      price: 18000,
      originalPrice: 22000,
      category: 'Accessories',
      brand: 'Sony',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: {
        'Type': 'Over-ear',
        'Connectivity': 'Bluetooth 5.0',
        'Battery Life': 'Up to 30 hours',
        'Noise Cancellation': 'Industry-leading'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-010',
      name: 'Nintendo Switch OLED',
      description: 'Like new Nintendo Switch OLED model with games included.',
      price: 25000,
      originalPrice: 28000,
      category: 'Gaming',
      brand: 'Nintendo',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Storage: 64GB, Display: 7" OLED, Battery: Up to 9 hours, Connectivity: WiFi, Bluetooth, Weight: 320g',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-011',
      name: 'Xiaomi Mi 11',
      description: 'Great condition Xiaomi Mi 11 smartphone with premium features.',
      price: 28000,
      originalPrice: 35000,
      category: 'Smartphones',
      brand: 'Xiaomi',
      condition: 'Good',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Storage: 256GB, Color: Midnight Gray, Battery: 4600mAh, Screen: 6.81" AMOLED, Camera: 108MP triple camera, Processor: Snapdragon 888',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-012',
      name: 'ASUS ROG Strix G15',
      description: 'Gaming laptop in excellent condition. Perfect for gaming and content creation.',
      price: 75000,
      originalPrice: 85000,
      category: 'Gaming',
      brand: 'ASUS',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: AMD Ryzen 7, Memory: 16GB RAM, Storage: 1TB SSD, Display: 15.6" FHD 144Hz, Graphics: RTX 3060, Weight: 2.3 kg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-013',
      name: 'AirPods Pro 2nd Gen',
      description: 'Like new AirPods Pro with active noise cancellation.',
      price: 12000,
      originalPrice: 15000,
      category: 'Accessories',
      brand: 'Apple',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Type: True Wireless, Connectivity: Bluetooth 5.3, Battery: Up to 6 hours, Features: Active Noise Cancellation, Weight: 5.3g each',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-014',
      name: 'Lenovo ThinkPad X1 Carbon',
      description: 'Premium business laptop in excellent condition. Ultra-lightweight and powerful.',
      price: 68000,
      originalPrice: 78000,
      category: 'Laptops',
      brand: 'Lenovo',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: Intel Core i7, Memory: 16GB RAM, Storage: 512GB SSD, Display: 14" FHD, Graphics: Intel Iris Xe, Weight: 1.13 kg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-015',
      name: 'Google Pixel 6 Pro',
      description: 'Excellent condition Google Pixel 6 Pro with amazing camera.',
      price: 42000,
      originalPrice: 50000,
      category: 'Smartphones',
      brand: 'Google',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Storage: 128GB, Color: Stormy Black, Battery: 5003mAh, Screen: 6.7" LTPO OLED, Camera: 50MP triple camera, Processor: Google Tensor',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-016',
      name: 'Microsoft Surface Pro 8',
      description: 'Like new Microsoft Surface Pro 8 tablet/laptop hybrid.',
      price: 58000,
      originalPrice: 68000,
      category: 'Tablets',
      brand: 'Microsoft',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: Intel Core i5, Memory: 8GB RAM, Storage: 256GB SSD, Display: 13" PixelSense, Battery: Up to 16 hours, Weight: 891g',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-017',
      name: 'Bose QuietComfort 45',
      description: 'Premium noise-canceling headphones in excellent condition.',
      price: 22000,
      originalPrice: 26000,
      category: 'Accessories',
      brand: 'Bose',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Type: Over-ear, Connectivity: Bluetooth 5.1, Battery: Up to 24 hours, Noise Cancellation: Active, Weight: 238g',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-018',
      name: 'Huawei MateBook X Pro',
      description: 'Premium Huawei MateBook X Pro in excellent condition.',
      price: 62000,
      originalPrice: 72000,
      category: 'Laptops',
      brand: 'Huawei',
      condition: 'Excellent',
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Processor: Intel Core i7, Memory: 16GB RAM, Storage: 512GB SSD, Display: 13.9" 3K Touch, Graphics: Intel Iris Xe, Weight: 1.33 kg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-019',
      name: 'PlayStation 5',
      description: 'Like new PlayStation 5 console with controller and games.',
      price: 35000,
      originalPrice: 40000,
      category: 'Gaming',
      brand: 'Sony',
      condition: 'Like New',
      images: [
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Storage: 825GB SSD, Connectivity: WiFi 6, Bluetooth 5.1, Ports: USB-C, USB-A, HDMI 2.1, Weight: 4.5 kg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PROD-020',
      name: 'Realme GT 2 Pro',
      description: 'Great condition Realme GT 2 Pro smartphone with flagship features.',
      price: 32000,
      originalPrice: 38000,
      category: 'Smartphones',
      brand: 'Realme',
      condition: 'Good',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&crop=center'
      ],
      specifications: 'Storage: 256GB, Color: Paper White, Battery: 5000mAh, Screen: 6.7" AMOLED, Camera: 50MP triple camera, Processor: Snapdragon 8 Gen 1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Store sample products
  safeSetItem('products', sampleProducts, true);

  // Sample users
  const sampleUsers = [
    {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@techcycle.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-001',
      username: 'testuser',
      email: 'user@example.com',
      password: 'user123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isVerified: true,
      createdAt: new Date().toISOString()
    }
  ];

  safeSetItem('users', sampleUsers, true);
};

// Utility function to clear all localStorage data
export const clearAllStorage = () => {
  try {
    const keysToKeep = ['techCycleUser'];
    const currentUser = localStorage.getItem('techCycleUser');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore current user
    if (currentUser) {
      localStorage.setItem('techCycleUser', currentUser);
    }
    
    console.log('All storage cleared except current user');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Export all APIs
export default {
  authAPI,
  productAPI,
  cartAPI,
  orderAPI,
  paymentAPI,
  createAdminUser,
  createTestUser,
  initializeSampleData,
  clearAllStorage
};
