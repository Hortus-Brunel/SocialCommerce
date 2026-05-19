// =========================
// API CLIENT & STATE MANAGEMENT
// =========================
// Handles all API calls and application state

const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  // =====================
  // AUTHENTICATION
  // =====================

  async register(userData) {
    try {
      const response = await this.post('/auth/register', userData);
      if (response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      const response = await this.post('/auth/login', { email, password });
      if (response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;
    window.location.href = '/frontend/pages/login.html';
  }

  // =====================
  // PRODUCTS
  // =====================

  async getProducts(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      return await this.get(`/products?${query}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProduct(productId) {
    try {
      return await this.get(`/products/${productId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createProduct(productData) {
    try {
      return await this.post('/products', productData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProduct(productId, updates) {
    try {
      return await this.put(`/products/${productId}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteProduct(productId) {
    try {
      return await this.delete(`/products/${productId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // ORDERS
  // =====================

  async createOrder(orderData) {
    try {
      return await this.post('/orders', orderData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrders() {
    try {
      return await this.get('/orders/my-orders');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrder(orderId) {
    try {
      return await this.get(`/orders/${orderId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      return await this.put(`/orders/${orderId}`, { status });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // PAYMENTS
  // =====================

  async processPayment(paymentData) {
    try {
      return await this.post('/payments/process', paymentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentStatus(transactionId) {
    try {
      return await this.get(`/payments/status/${transactionId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // SOCIAL FEATURES
  // =====================

  async likeProduct(productId) {
    try {
      return await this.post(`/social/like`, { productId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addComment(productId, comment) {
    try {
      return await this.post(`/social/comment`, { productId, comment });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getComments(productId) {
    try {
      return await this.get(`/social/comments/${productId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async followSeller(sellerId) {
    try {
      return await this.post(`/social/follow`, { sellerId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // BUSINESS
  // =====================

  async getBusinessProfile(businessId) {
    try {
      return await this.get(`/businesses/${businessId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBusinessProfile(updates) {
    try {
      return await this.put(`/businesses/profile`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBusinessStats() {
    try {
      return await this.get(`/businesses/stats`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // AI RECOMMENDATIONS
  // =====================

  async getRecommendations() {
    try {
      return await this.get(`/ai/recommendations`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSearchSuggestions(query) {
    try {
      return await this.get(`/ai/suggestions?q=${encodeURIComponent(query)}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // ADMIN
  // =====================

  async getAdminStats() {
    try {
      return await this.get(`/admin/stats`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUsers() {
    try {
      return await this.get(`/admin/users`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================
  // HTTP METHODS
  // =====================

  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  async request(method, endpoint, body = null) {
    const url = this.baseURL + endpoint;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Unauthorized. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  handleError(error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return new Error('Connection failed. Please check your internet connection.');
    }
    return error;
  }
}

// Initialize global API client
const apiClient = new APIClient();

// =========================
// UTILITY FUNCTIONS
// =========================

async function validateAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    window.location.href = '../pages/login.html';
    return false;
  }

  return true;
}

async function requireRole(requiredRole) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user || user.role !== requiredRole) {
    alert('You do not have permission to access this page.');
    window.location.href = '../index.html';
    return false;
  }

  return true;
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.role === 'admin';
}

function isBusiness() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.role === 'business';
}

function isCustomer() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.role === 'customer';
}

// =========================
// GLOBAL STATE
// =========================

window.apiClient = apiClient;
window.validateAuth = validateAuth;
window.requireRole = requireRole;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.isBusiness = isBusiness;
window.isCustomer = isCustomer;
