// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

class APIService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(userData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  logout() {
    this.clearToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Transaction endpoints
  async getTransactions(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.type) queryParams.append('type', filters.type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const query = queryParams.toString();
    return await this.request(`/transactions${query ? '?' + query : ''}`);
  }

  async getTransaction(id) {
    return await this.request(`/transactions/${id}`);
  }

  async createTransaction(transactionData) {
    return await this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async updateTransaction(id, transactionData) {
    return await this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  }

  async deleteTransaction(id) {
    return await this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  async getStats(startDate, endDate) {
    const queryParams = new URLSearchParams({ startDate, endDate });
    return await this.request(`/transactions/stats?${queryParams.toString()}`);
  }

  async getCategoryBreakdown(type, startDate, endDate) {
    const queryParams = new URLSearchParams({ type, startDate, endDate });
    return await this.request(`/transactions/category-breakdown?${queryParams.toString()}`);
  }

  async getMonthlyTrend(months = 6) {
    const queryParams = new URLSearchParams({ months: months.toString() });
    return await this.request(`/transactions/monthly-trend?${queryParams.toString()}`);
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Export singleton instance
const api = new APIService();
