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
        stock: parseInt(productData.stock) || 0,
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
            stock: product.stock
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
        subtotal: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        shippingFee: orderData.shippingFee || 0,
        total: 0,
        status: 'pending',
        paymentStatus: 'pending',
        shippingStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      order.total = order.subtotal + order.shippingFee;

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
  // Sample products
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
      stock: 5,
      images: ['https://via.placeholder.com/400x300?text=iPhone+13+Pro'],
      specifications: {
        'Storage': '256GB',
        'Color': 'Graphite',
        'Battery Health': '95%',
        'Screen': '6.1" Super Retina XDR',
        'Camera': 'Triple 12MP camera system',
        'Processor': 'A15 Bionic chip'
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
      stock: 3,
      images: ['https://via.placeholder.com/400x300?text=MacBook+Air+M2'],
      specifications: {
        'Processor': 'Apple M2 chip',
        'Memory': '8GB RAM',
        'Storage': '256GB SSD',
        'Display': '13.6" Liquid Retina',
        'Battery': 'Up to 18 hours',
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
      stock: 8,
      images: ['https://via.placeholder.com/400x300?text=Galaxy+S22'],
      specifications: {
        'Storage': '128GB',
        'Color': 'Phantom Black',
        'Battery': '3700mAh',
        'Screen': '6.1" Dynamic AMOLED',
        'Camera': 'Triple camera system',
        'Processor': 'Snapdragon 8 Gen 1'
      },
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
