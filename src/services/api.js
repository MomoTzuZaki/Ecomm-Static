const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests (database only)
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Authentication API (Database Only)
export const authAPI = {
  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },
};

// Verification API (Database Only)
export const verificationAPI = {
  submitVerification: async (verificationData) => {
    return await apiRequest('/verifications', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  },

  getMyVerificationStatus: async () => {
    return await apiRequest('/verifications/my-status');
  },

  getAllVerifications: async () => {
    return await apiRequest('/verifications');
  },

  updateVerificationStatus: async (verificationId, status) => {
    return await apiRequest(`/verifications/${verificationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Products API (Database Only)
export const productsAPI = {
  getAllProducts: async () => {
    return await apiRequest('/products');
  },

  getProductById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  createProduct: async (productData) => {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id, productData) => {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  getMyProducts: async () => {
    return await apiRequest('/products/my-products');
  },
};

// Users API (Database Only)
export const usersAPI = {
  getAllUsers: async () => {
    return await apiRequest('/users');
  },

  getUserById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  updateUser: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API (Database Only)
export const cartAPI = {
  getCart: async () => {
    return await apiRequest('/cart');
  },

  addToCart: async (productId, quantity = 1) => {
    return await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartItem: async (cartItemId, quantity) => {
    return await apiRequest(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (cartItemId) => {
    return await apiRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  verificationAPI,
  productsAPI,
  usersAPI,
  cartAPI,
};