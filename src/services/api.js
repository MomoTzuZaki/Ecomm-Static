// Frontend-only mock API for development: no backend calls.
// Persists to localStorage to enable simple login and signup flows.

const USERS_KEY = 'techCycleUsers';

const readUsers = () => {
  const raw = localStorage.getItem(USERS_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const generateToken = (email) => {
  const base = `${email}-${Date.now()}`;
  return btoa(unescape(encodeURIComponent(base)));
};

const ensureDemoUsers = () => {
  const users = readUsers();
  const byEmail = (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!byEmail('user@techcycle.com')) {
    users.push({
      id: 'u-demo',
      username: 'Demo User',
      email: 'user@techcycle.com',
      password: 'password',
      role: 'user',
      isVerified: false,
    });
  }

  if (!byEmail('admin@techcycle.com')) {
    users.push({
      id: 'u-admin',
      username: 'Admin',
      email: 'admin@techcycle.com',
      password: 'password',
      role: 'admin',
      isVerified: true,
    });
  }

  writeUsers(users);
};

ensureDemoUsers();

export const authAPI = {
  register: async (userData) => {
    const { email, password, username } = userData;
    const users = readUsers();
    const normalizedEmail = String(email || '').toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    // UI-only: always succeed. If user exists, log them in; else create.
    if (!user) {
      user = {
        id: `u-${Date.now()}`,
        username: username || (normalizedEmail.split('@')[0] || 'User'),
        email: normalizedEmail,
        password: password || '',
        role: 'user',
        isVerified: false,
      };
      users.push(user);
      writeUsers(users);
    }

    const token = generateToken(user.email);
    return { token, user: { ...user, password: undefined } };
  },

  login: async (credentials) => {
    const { email, password } = credentials;
    const users = readUsers();
    const normalizedEmail = String(email || '').toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    // UI-only: accept any credentials, auto-provision if missing
    if (!user) {
      const username = normalizedEmail.split('@')[0] || 'User';
      user = {
        id: `u-${Date.now()}`,
        username,
        email: normalizedEmail,
        password: password || '',
        role: 'user',
        isVerified: false,
      };
      users.push(user);
      writeUsers(users);
    }

    const token = generateToken(user.email);
    return { token, user: { ...user, password: undefined } };
  },

  getCurrentUser: async () => {
    const raw = localStorage.getItem('techCycleUser');
    return raw ? JSON.parse(raw) : null;
  },
};

// Database API for verification management
export const verificationAPI = {
  submitVerification: async (verificationData) => {
    const token = localStorage.getItem('techCycleToken');
    const response = await fetch('/api/verifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(verificationData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit verification');
    }
    
    return await response.json();
  },

  getMyVerificationStatus: async () => {
    const token = localStorage.getItem('techCycleToken');
    const response = await fetch('/api/verifications/my-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get verification status');
    }
    
    return await response.json();
  },

  getAllVerifications: async () => {
    const token = localStorage.getItem('techCycleToken');
    const response = await fetch('/api/verifications/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get verifications');
    }
    
    return await response.json();
  },

  updateVerificationStatus: async (verificationId, status, rejectionReason = null) => {
    const token = localStorage.getItem('techCycleToken');
    const response = await fetch(`/api/verifications/${verificationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, rejectionReason })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update verification status');
    }
    
    return await response.json();
  }
};

// Helper generates plausible mock products procedurally for UI-only mode

const generateMockProducts = (count, startIndex = 1) => {
  const categories = [
    { cat: 'Smartphones', items: [
      { brand: 'Google', model: 'Pixel 7', seed: 'pixel7', basePrice: 499 },
      { brand: 'Samsung', model: 'Galaxy S21', seed: 's21', basePrice: 459 },
      { brand: 'Apple', model: 'iPhone 12', seed: 'iphone12', basePrice: 529 },
    ]},
    { cat: 'Laptops', items: [
      { brand: 'Apple', model: 'MacBook Air M1', seed: 'mba-m1', basePrice: 749 },
      { brand: 'Lenovo', model: 'ThinkPad X1', seed: 'x1', basePrice: 999 },
      { brand: 'ASUS', model: 'Zephyrus G14', seed: 'g14', basePrice: 1199 },
    ]},
    { cat: 'Audio', items: [
      { brand: 'Bose', model: 'QC 45', seed: 'qc45', basePrice: 229 },
      { brand: 'Sennheiser', model: 'HD 560S', seed: 'hd560s', basePrice: 159 },
      { brand: 'Sony', model: 'WF-1000XM4', seed: 'xm4buds', basePrice: 179 },
    ]},
    { cat: 'Cameras', items: [
      { brand: 'Sony', model: 'A6400', seed: 'a6400', basePrice: 799 },
      { brand: 'Fujifilm', model: 'X-T30', seed: 'xt30', basePrice: 649 },
      { brand: 'Canon', model: 'EOS RP', seed: 'eosrp', basePrice: 899 },
    ]},
  ];

  const conditions = ['Excellent', 'Good', 'Fair'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Denver, CO'];
  const highlightsPool = ['Original box included', 'Lightly used', 'Battery health 90%+', 'Unlocked', 'Ships fast'];

  const out = [];
  let idCounter = startIndex;
  while (out.length < count) {
    const group = categories[Math.floor(Math.random() * categories.length)];
    const item = group.items[Math.floor(Math.random() * group.items.length)];
    const priceFluctuation = Math.floor(Math.random() * 80) - 20; // +/- up to $20
    const price = Math.max(20, item.basePrice + priceFluctuation);
    const originalPrice = price + Math.floor(0.2 * price);
    const title = `${item.brand} ${item.model}`;
    const description = `${title} in ${conditions[Math.floor(Math.random()*conditions.length)]} condition. Carefully used, fully functional, and cleaned. Great value for daily use.`;
    const images = [
      `https://picsum.photos/seed/${item.seed}-front/600/400`,
      `https://picsum.photos/seed/${item.seed}-alt/600/400`,
    ];
    const highlights = Array.from({ length: 3 }, () => highlightsPool[Math.floor(Math.random()*highlightsPool.length)]);
    out.push({
      id: `p-auto-${idCounter++}`,
      title,
      description,
      price,
      originalPrice,
      category: group.cat,
      condition: conditions[Math.floor(Math.random()*conditions.length)],
      brand: item.brand,
      images,
      location: locations[Math.floor(Math.random()*locations.length)],
      datePosted: 'This month',
      seller: { name: 'Marketplace Seller', isVerified: Math.random() > 0.5, rating: 4.5, totalSales: Math.floor(Math.random()*100) },
      specifications: {},
      highlights,
    });
  }
  return out;
};

export const productsAPI = {
  getAllProducts: async () => {
    // Seed demo products if not present
    const key = 'techCycleProducts';
    // Clear existing data to force reload with new image URLs
    localStorage.removeItem(key);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const demo = [
        {
          id: 'p-1',
          title: 'Apple iPhone 13 Pro 128GB - Sierra Blue',
          description: 'Lightly used iPhone 13 Pro in Sierra Blue. Battery health 93%, always used with case and screen protector. Includes original box and cable.',
          price: 799,
          originalPrice: 999,
          category: 'Smartphones',
          condition: 'Excellent',
          brand: 'Apple',
          storage: '128GB',
          color: 'Sierra Blue',
          screenSize: '6.1 inches',
          dimensions: '146.7 x 71.5 x 7.65 mm',
          weight: '203g',
          warranty: 'No warranty (used)',
          accessories: 'Original box, cable',
          images: [
            'https://picsum.photos/600/400?random=1',
            'https://picsum.photos/600/400?random=2',
            'https://picsum.photos/600/400?random=3'
          ],
          location: 'San Francisco, CA',
          datePosted: 'Today',
          seller: { name: 'Alice', isVerified: true, rating: 4.9, totalSales: 58, joinDate: '2021-09-01', responseRate: '99%' },
          specifications: {
            Display: '6.1-inch Super Retina XDR',
            Chip: 'A15 Bionic',
            Camera: 'Triple 12MP system',
            Connectivity: '5G, Wi‑Fi 6, Bluetooth 5.0'
          },
          highlights: ['93% battery health', 'Always cased', 'Clean IMEI', 'Unlocked']
        },
        {
          id: 'p-2',
          title: 'Dell XPS 13 (9310) i7 • 16GB • 512GB SSD',
          description: 'Portable ultrabook with Intel i7, 16GB RAM, and 512GB NVMe SSD. Minor wear on palm rest. Great battery and sharp FHD+ display.',
          price: 1099,
          originalPrice: 1399,
          category: 'Laptops',
          condition: 'Good',
          brand: 'Dell',
          storage: '512GB',
          color: 'Platinum Silver',
          screenSize: '13.4 inches',
          dimensions: '295.7 x 198.7 x 14.8 mm',
          weight: '1.2 kg',
          warranty: '3 months store warranty',
          accessories: 'USB-C charger',
          images: [
            'https://picsum.photos/600/400?random=4',
            'https://picsum.photos/600/400?random=5',
            'https://picsum.photos/600/400?random=6'
          ],
          location: 'Austin, TX',
          datePosted: 'Yesterday',
          seller: { name: 'Bob', isVerified: false, rating: 4.5, totalSales: 21, joinDate: '2020-05-15', responseRate: '95%' },
          specifications: {
            Processor: 'Intel Core i7-1165G7',
            Memory: '16GB LPDDR4x',
            Storage: '512GB NVMe SSD',
            Display: 'FHD+ (1920 x 1200)'
          },
          highlights: ['Thin & light', 'Backlit keyboard', 'Thunderbolt 4']
        },
        {
          id: 'p-3',
          title: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
          description: 'Like-new XM5s with excellent ANC. Used for a few months. Comes with case and cable. Sounds amazing for travel and work.',
          price: 279,
          originalPrice: 349,
          category: 'Audio',
          condition: 'Excellent',
          brand: 'Sony',
          color: 'Black',
          weight: '250g',
          warranty: 'Manufacturer warranty until 2026-02',
          accessories: 'Case, USB-C cable, adapter',
          images: [
            'https://picsum.photos/600/400?random=7',
            'https://picsum.photos/600/400?random=8',
            'https://picsum.photos/600/400?random=9'
          ],
          location: 'Seattle, WA',
          datePosted: '2 days ago',
          seller: { name: 'Carol', isVerified: true, rating: 4.8, totalSales: 33, joinDate: '2019-11-20', responseRate: '96%' },
          specifications: {
            Drivers: '30mm',
            Connectivity: 'Bluetooth 5.2, LDAC',
            Battery: 'Up to 30h (ANC on)'
          },
          highlights: ['Top-tier ANC', 'Multi-device pairing', 'USB-C fast charge']
        },
        {
          id: 'p-4',
          title: 'Canon EOS M50 Mark II Mirrorless Camera (15-45mm Kit)',
          description: 'Great starter mirrorless camera. Low shutter count, clean sensor. Perfect for content creators and travel.',
          price: 539,
          originalPrice: 699,
          category: 'Cameras',
          condition: 'Good',
          brand: 'Canon',
          color: 'Black',
          weight: '387g',
          accessories: '15–45mm kit lens, strap, battery, charger',
          images: [
            'https://picsum.photos/600/400?random=10',
            'https://picsum.photos/600/400?random=11',
            'https://picsum.photos/600/400?random=12'
          ],
          location: 'Denver, CO',
          datePosted: '3 days ago',
          seller: { name: 'Diego', isVerified: false, rating: 4.4, totalSales: 12, joinDate: '2022-03-10', responseRate: '90%' },
          specifications: {
            Sensor: '24.1MP APS-C',
            Video: '4K/24p',
            Mount: 'Canon EF-M'
          },
          highlights: ['Flip screen', 'Clean sensor', 'Includes kit lens']
        },
        {
          id: 'p-5',
          title: 'Samsung Galaxy Tab S7 128GB + Keyboard Cover',
          description: 'Slim Android tablet with 120Hz display. Comes with official keyboard cover. Ideal for browsing, notes, and media.',
          price: 429,
          originalPrice: 649,
          category: 'Tablets',
          condition: 'Good',
          brand: 'Samsung',
          storage: '128GB',
          color: 'Mystic Black',
          screenSize: '11 inches',
          images: [
            'https://picsum.photos/600/400?random=13',
            'https://picsum.photos/600/400?random=14'
          ],
          location: 'Chicago, IL',
          datePosted: 'This week',
          seller: { name: 'Eva', isVerified: true, rating: 4.7, totalSales: 41, joinDate: '2020-01-05', responseRate: '97%' },
          specifications: {
            Display: '120Hz LTPS LCD',
            Chip: 'Snapdragon 865+',
            Battery: '8000mAh'
          },
          highlights: ['Keyboard cover', '120Hz display', 'S-Pen compatible']
        },
        {
          id: 'p-6',
          title: 'Apple AirPods Pro (2nd Gen)',
          description: 'AirPods Pro 2 in excellent condition with new ear tips. Includes charging case and cable.',
          price: 189,
          originalPrice: 249,
          category: 'Audio',
          condition: 'Excellent',
          brand: 'Apple',
          color: 'White',
          images: [
            'https://picsum.photos/600/400?random=15',
            'https://picsum.photos/600/400?random=16'
          ],
          location: 'New York, NY',
          datePosted: 'Today',
          seller: { name: 'Frank', isVerified: true, rating: 4.9, totalSales: 85, joinDate: '2018-07-18', responseRate: '99%' },
          specifications: {
            Chip: 'Apple H2',
            ANC: 'Active Noise Cancellation',
            Battery: 'Up to 6 hours (earbuds)'
          },
          highlights: ['MagSafe case', 'Find My support', 'Great ANC']
        }
      ];
      localStorage.setItem(key, JSON.stringify(demo));
      return demo;
    }
    try {
      const existing = JSON.parse(raw);
      // If you want more variety during dev, auto-top-up to ~16 items
      if (Array.isArray(existing) && existing.length < 16) {
        const generated = generateMockProducts(16 - existing.length, existing.length + 1);
        const augmented = [...existing, ...generated];
        localStorage.setItem(key, JSON.stringify(augmented));
        return augmented;
      }
      return existing;
    } catch {
      return [];
    }
  },
  getProductById: async (id) => {
    const raw = localStorage.getItem('techCycleProducts');
    const list = raw ? JSON.parse(raw) : [];
    return list.find(p => p.id === id) || null;
  },
  createProduct: async (productData) => {
    const raw = localStorage.getItem('techCycleProducts');
    const list = raw ? JSON.parse(raw) : [];
    const newProduct = { id: `p-${Date.now()}`, ...productData };
    list.push(newProduct);
    localStorage.setItem('techCycleProducts', JSON.stringify(list));
    return newProduct;
  },
  updateProduct: async (id, productData) => {
    const raw = localStorage.getItem('techCycleProducts');
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const updated = { ...list[idx], ...productData };
    list[idx] = updated;
    localStorage.setItem('techCycleProducts', JSON.stringify(list));
    return updated;
  },
  deleteProduct: async (id) => {
    const raw = localStorage.getItem('techCycleProducts');
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem('techCycleProducts', JSON.stringify(filtered));
    return true;
  },
  getMyProducts: async () => {
    // In UI-only mode, return all products for simplicity
    return await productsAPI.getAllProducts();
  },
};

export const usersAPI = {
  getAllUsers: async () => { throw new Error('Not available in UI-only mode'); },
  getUserById: async () => { throw new Error('Not available in UI-only mode'); },
  updateUser: async () => { throw new Error('Not available in UI-only mode'); },
  deleteUser: async () => { throw new Error('Not available in UI-only mode'); },
};

export const cartAPI = {
  getCart: async () => {
    const raw = localStorage.getItem('techCycleCart');
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  addToCart: async (productId, quantity = 1) => {
    const productsRaw = localStorage.getItem('techCycleProducts');
    const products = productsRaw ? JSON.parse(productsRaw) : [];
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const raw = localStorage.getItem('techCycleCart');
    const cart = raw ? JSON.parse(raw) : [];

    // If already in cart, increase quantity
    const existing = cart.find(item => item.product?.id === productId);
    if (existing) {
      existing.quantity += quantity;
      localStorage.setItem('techCycleCart', JSON.stringify(cart));
      return existing;
    }

    const newItem = { id: `c-${Date.now()}`, product, quantity };
    cart.push(newItem);
    localStorage.setItem('techCycleCart', JSON.stringify(cart));
    return newItem;
  },
  updateCartItem: async (cartItemId, quantity) => {
    const raw = localStorage.getItem('techCycleCart');
    const cart = raw ? JSON.parse(raw) : [];
    const idx = cart.findIndex(item => item.id === cartItemId);
    if (idx === -1) throw new Error('Cart item not found');
    cart[idx] = { ...cart[idx], quantity };
    localStorage.setItem('techCycleCart', JSON.stringify(cart));
    return cart[idx];
  },
  removeFromCart: async (cartItemId) => {
    const raw = localStorage.getItem('techCycleCart');
    const cart = raw ? JSON.parse(raw) : [];
    const filtered = cart.filter(item => item.id !== cartItemId);
    localStorage.setItem('techCycleCart', JSON.stringify(filtered));
    return true;
  },
  clearCart: async () => {
    localStorage.setItem('techCycleCart', JSON.stringify([]));
    return true;
  },
};

// Mock transaction data storage
const TRANSACTIONS_KEY = 'techCycleTransactions';

const readTransactions = () => {
  const raw = localStorage.getItem(TRANSACTIONS_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const writeTransactions = (transactions) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const transactionAPI = {
  createTransaction: async (productId, shippingAddress, paymentMethod) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactions = readTransactions();
    const user = JSON.parse(localStorage.getItem('techCycleUser') || '{}');
    
    // Check if current user has already ordered this product
    const userExistingTransaction = transactions.find(t => 
      t.productId === productId && 
      t.buyerId === (user.id || 'user-1') &&
      ['pending_payment', 'paid', 'admin_verification', 'completed'].includes(t.status)
    );
    
    if (userExistingTransaction) {
      console.log('User already has an order for this product:', productId);
      throw new Error('You have already placed an order for this product. You can only order each item once.');
    }
    
    // Check if product is already being purchased by another user
    const otherUserTransaction = transactions.find(t => 
      t.productId === productId && 
      t.buyerId !== (user.id || 'user-1') &&
      ['pending_payment', 'paid', 'admin_verification'].includes(t.status)
    );
    
    if (otherUserTransaction) {
      console.log('Product already being ordered by another user:', productId);
      throw new Error('This product is already being ordered by another buyer. Please check back later or browse other products.');
    }
    
    // Get product details
    const products = JSON.parse(localStorage.getItem('techCycleProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if product is available for purchase
    if (product.status === 'sold') {
      console.log('Product already sold:', productId, product.status);
      throw new Error('This product has already been sold.');
    }
    
    if (product.status === 'pending_sale') {
      console.log('Product already pending sale:', productId, product.status);
      throw new Error('This product is already being ordered by another buyer. Please check back later or browse other products.');
    }
    
    const transaction = {
      id: `txn-${Date.now()}`,
      buyerId: user.id || 'user-1',
      sellerId: product.seller?.id || 'seller-1',
      productId: productId,
      amount: product.price,
      commission: Math.round(product.price * 0.03 * 100) / 100,
      sellerAmount: Math.round((product.price - (product.price * 0.03)) * 100) / 100,
      status: 'pending_payment',
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buyer: {
        id: user.id || 'user-1',
        username: user.username || 'Current User',
        email: user.email || 'user@example.com',
        firstName: user.firstName || 'User',
        lastName: user.lastName || 'Name'
      },
      seller: product.seller || {
        id: 'seller-1',
        username: 'Product Seller',
        email: 'seller@example.com',
        firstName: 'Seller',
        lastName: 'Name'
      },
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category
      }
    };
    
    transactions.push(transaction);
    writeTransactions(transactions);
    
    // Update product status to pending_sale
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      products[productIndex].status = 'pending_sale';
      localStorage.setItem('techCycleProducts', JSON.stringify(products));
    }
    
    return {
      message: 'Transaction created successfully',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        commission: transaction.commission,
        sellerAmount: transaction.sellerAmount,
        status: transaction.status
      }
    };
  },

  processPayment: async (transactionId, paymentMethod, paymentReference, paymentDetails, receiptFile = null) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactions = readTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // Determine payment status based on method
    let paymentStatus = 'completed';
    let transactionStatus = 'admin_verification';
    
    // For QR code payments, status is pending receipt verification
    if (['gcash', 'bank_transfer', 'paymaya'].includes(paymentMethod)) {
      paymentStatus = 'pending_receipt_verification';
      transactionStatus = 'pending_receipt_verification';
    }
    
    // Update transaction status
    transaction.status = transactionStatus;
    transaction.paymentReference = paymentReference;
    transaction.paymentDetails = paymentDetails;
    transaction.receiptFile = receiptFile;
    transaction.updatedAt = new Date().toISOString();
    
    // Add payment record
    transaction.payments = [{
      id: `pay-${Date.now()}`,
      transactionId: transactionId,
      amount: transaction.amount,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      status: paymentStatus,
      receiptFile: receiptFile,
      processedAt: new Date().toISOString()
    }];
    
    writeTransactions(transactions);
    
    return {
      message: 'Payment initiated successfully',
      payment: {
        id: transaction.payments[0].id,
        amount: transaction.amount,
        status: paymentStatus
      }
    };
  },

  getMyTransactions: async (type = null) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactions = readTransactions();
    const user = JSON.parse(localStorage.getItem('techCycleUser') || '{}');
    
    let filteredTransactions = transactions;
    
    if (type === 'buyer') {
      filteredTransactions = transactions.filter(t => t.buyerId === user.id);
    } else if (type === 'seller') {
      filteredTransactions = transactions.filter(t => t.sellerId === user.id);
    }
    
    return { transactions: filteredTransactions };
  },

  getTransactionDetails: async (transactionId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactions = readTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return { transaction };
  },

  cancelTransaction: async (transactionId, reason) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactions = readTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    transaction.status = 'cancelled';
    transaction.adminNotes = reason;
    transaction.updatedAt = new Date().toISOString();
    
    writeTransactions(transactions);
    
    // Make product available again
    const products = JSON.parse(localStorage.getItem('techCycleProducts') || '[]');
    const productIndex = products.findIndex(p => p.id === transaction.productId);
    if (productIndex !== -1) {
      products[productIndex].status = 'approved'; // Reset to approved status
      localStorage.setItem('techCycleProducts', JSON.stringify(products));
    }
    
    return {
      message: 'Transaction cancelled successfully',
      transaction
    };
  },

  // Admin functions
  getPendingVerifications: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const transactions = readTransactions();
    const pendingTransactions = transactions.filter(t => 
      t.status === 'admin_verification' || t.status === 'pending_receipt_verification'
    );
    
    return { transactions: pendingTransactions };
  },

  verifyTransaction: async (transactionId, adminNotes, trackingNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactions = readTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    transaction.status = 'completed';
    transaction.adminNotes = adminNotes;
    transaction.trackingNumber = trackingNumber;
    transaction.verifiedAt = new Date().toISOString();
    transaction.verifiedBy = 'admin-1';
    transaction.completedAt = new Date().toISOString();
    transaction.updatedAt = new Date().toISOString();
    
    writeTransactions(transactions);
    
    // Update product status to sold
    const products = JSON.parse(localStorage.getItem('techCycleProducts') || '[]');
    const productIndex = products.findIndex(p => p.id === transaction.productId);
    if (productIndex !== -1) {
      products[productIndex].status = 'sold';
      localStorage.setItem('techCycleProducts', JSON.stringify(products));
    }
    
    return {
      message: 'Transaction verified and completed successfully',
      transaction
    };
  }
};

export default {
  authAPI,
  verificationAPI,
  productsAPI,
  usersAPI,
  cartAPI,
  transactionAPI,
};