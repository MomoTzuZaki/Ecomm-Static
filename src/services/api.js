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

// Stubs to avoid accidental network usage. You can extend these later if needed.
export const verificationAPI = {
  submitVerification: async () => { throw new Error('Not available in UI-only mode'); },
  getMyVerificationStatus: async () => { throw new Error('Not available in UI-only mode'); },
  getAllVerifications: async () => { throw new Error('Not available in UI-only mode'); },
  updateVerificationStatus: async () => { throw new Error('Not available in UI-only mode'); },
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
            'https://source.unsplash.com/featured/600x400?iphone-13-pro,apple,smartphone',
            'https://source.unsplash.com/featured/600x400?iphone-13-pro,back,apple',
            'https://source.unsplash.com/featured/600x400?iphone-13-pro,macro,apple'
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
            'https://source.unsplash.com/featured/600x400?dell-xps-13,laptop',
            'https://source.unsplash.com/featured/600x400?dell-xps,keyboard',
            'https://source.unsplash.com/featured/600x400?ultrabook,dell'
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
            'https://source.unsplash.com/featured/600x400?sony-wh-1000xm5,headphones',
            'https://source.unsplash.com/featured/600x400?sony-headphones,black',
            'https://source.unsplash.com/featured/600x400?headphone,case'
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
            'https://source.unsplash.com/featured/600x400?canon-eos-m50,camera',
            'https://source.unsplash.com/featured/600x400?mirrorless,canon',
            'https://source.unsplash.com/featured/600x400?camera,kit-lens'
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
            'https://source.unsplash.com/featured/600x400?galaxy-tab-s7,samsung,tablet',
            'https://source.unsplash.com/featured/600x400?android-tablet,keyboard-cover'
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
            'https://source.unsplash.com/featured/600x400?airpods-pro-2,earbuds',
            'https://source.unsplash.com/featured/600x400?airpods,charging-case'
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

export default {
  authAPI,
  verificationAPI,
  productsAPI,
  usersAPI,
  cartAPI,
};