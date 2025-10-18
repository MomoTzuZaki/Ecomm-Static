const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests with fallback
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

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.warn('API request failed, falling back to localStorage:', error.message);
    throw error;
  }
};

// Fallback functions for localStorage
const fallbackAuth = {
  register: async (userData) => {
    const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
    const existingUser = users.find(u => u.email === userData.email || u.username === userData.username);
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      role: 'user',
      isVerified: false,
      verificationStatus: 'none',
    };

    users.push(newUser);
    localStorage.setItem('techCycleUsers', JSON.stringify(users));
    
    return {
      token: 'mock-token-' + Date.now(),
      user: newUser,
    };
  },

  login: async (credentials) => {
    // Check for default admin account first
    if (credentials.email === 'admin@techcycle.com' && credentials.password === 'admin123') {
      const adminUser = {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@techcycle.com',
        role: 'admin',
        isVerified: true,
        verificationStatus: 'approved',
      };
      
      // Store admin user in localStorage for persistence
      const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
      const existingAdmin = users.find(u => u.email === 'admin@techcycle.com');
      if (!existingAdmin) {
        users.push(adminUser);
        localStorage.setItem('techCycleUsers', JSON.stringify(users));
      }
      
      return {
        token: 'admin-token-' + Date.now(),
        user: adminUser,
      };
    }

    // Check for default user account
    if (credentials.email === 'user@techcycle.com' && credentials.password === 'password') {
      const defaultUser = {
        id: 'user-001',
        username: 'user',
        email: 'user@techcycle.com',
        role: 'user',
        isVerified: true,
        verificationStatus: 'approved',
      };
      
      // Store user in localStorage for persistence
      const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
      const existingUser = users.find(u => u.email === 'user@techcycle.com');
      if (!existingUser) {
        users.push(defaultUser);
        localStorage.setItem('techCycleUsers', JSON.stringify(users));
      }
      
      return {
        token: 'user-token-' + Date.now(),
        user: defaultUser,
      };
    }

    const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      token: 'mock-token-' + Date.now(),
      user: user,
    };
  },
};

const fallbackVerification = {
  submitVerification: async (verificationData) => {
    const verifications = JSON.parse(localStorage.getItem('sellerVerifications') || '[]');
    const verificationId = `VER-${Date.now()}`;
    const user = JSON.parse(localStorage.getItem('techCycleUser') || '{}');
    
    const verification = {
      ...verificationData,
      userId: user.id,
      userEmail: user.email,
      verificationId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    verifications.push(verification);
    localStorage.setItem('sellerVerifications', JSON.stringify(verifications));

    // Update user status
    const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, verificationStatus: 'pending', verificationId };
      }
      return u;
    });
    localStorage.setItem('techCycleUsers', JSON.stringify(updatedUsers));

    return { verificationId };
  },

  getMyVerificationStatus: async () => {
    const verifications = JSON.parse(localStorage.getItem('sellerVerifications') || '[]');
    const user = JSON.parse(localStorage.getItem('techCycleUser') || '{}');
    const verification = verifications.find(v => v.userEmail === user.email);
    
    return { verification };
  },

  getAllVerifications: async () => {
    const verifications = JSON.parse(localStorage.getItem('sellerVerifications') || '[]');
    return { verifications };
  },

  updateVerificationStatus: async (verificationId, status, rejectionReason) => {
    const verifications = JSON.parse(localStorage.getItem('sellerVerifications') || '[]');
    const verification = verifications.find(v => v.verificationId === verificationId);
    
    if (verification) {
      verification.status = status;
      verification.reviewedAt = new Date().toISOString();
      if (rejectionReason) {
        verification.rejectionReason = rejectionReason;
      }
      
      localStorage.setItem('sellerVerifications', JSON.stringify(verifications));

      // Update user role if approved
      if (status === 'approved') {
        const users = JSON.parse(localStorage.getItem('techCycleUsers') || '[]');
        const updatedUsers = users.map(u => {
          if (u.email === verification.userEmail) {
            return { ...u, role: 'seller', isVerified: true, verificationStatus: 'approved' };
          }
          return u;
        });
        localStorage.setItem('techCycleUsers', JSON.stringify(updatedUsers));
      }
    }
  },
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      return await fallbackAuth.register(userData);
    }
  },

  login: async (credentials) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      return await fallbackAuth.login(credentials);
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiRequest('/auth/me');
    } catch (error) {
      // Return current user from localStorage
      const user = JSON.parse(localStorage.getItem('techCycleUser') || '{}');
      return user;
    }
  },
};

// Verification API
export const verificationAPI = {
  submitVerification: async (verificationData) => {
    try {
      return await apiRequest('/verifications', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });
    } catch (error) {
      return await fallbackVerification.submitVerification(verificationData);
    }
  },

  getMyVerificationStatus: async () => {
    try {
      return await apiRequest('/verifications/my-status');
    } catch (error) {
      return await fallbackVerification.getMyVerificationStatus();
    }
  },

  getAllVerifications: async () => {
    try {
      return await apiRequest('/verifications/all');
    } catch (error) {
      return await fallbackVerification.getAllVerifications();
    }
  },

  updateVerificationStatus: async (verificationId, status, rejectionReason) => {
    try {
      return await apiRequest(`/verifications/${verificationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, rejectionReason }),
      });
    } catch (error) {
      return await fallbackVerification.updateVerificationStatus(verificationId, status, rejectionReason);
    }
  },
};

// Products API
export const productsAPI = {
  getAllProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiRequest(`/products?${queryParams}`);
  },

  getProduct: async (productId) => {
    return apiRequest(`/products/${productId}`);
  },

  createProduct: async (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (productId, productData) => {
    return apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (productId) => {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });
  },

  getUserProducts: async (userId) => {
    return apiRequest(`/products/user/${userId}`);
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};
