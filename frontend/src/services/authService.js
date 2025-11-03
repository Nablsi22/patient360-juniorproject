// src/services/authService.js
import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_API = `${API_URL}/auth`;

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

const authService = {
  // Sign up new user
  signup: async (userData) => {
    try {
      const response = await axios.post(`${AUTH_API}/signup`, userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw error.response.data;
      } else if (error.request) {
        // Request made but no response
        throw { message: 'لا يمكن الاتصال بالخادم. الرجاء التحقق من اتصال الإنترنت.' };
      } else {
        // Something else happened
        throw { message: 'حدث خطأ غير متوقع' };
      }
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post(`${AUTH_API}/login`, { email, password });
      
      if (response.data.success) {
        // Store token and user info in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw { message: 'لا يمكن الاتصال بالخادم. الرجاء التحقق من اتصال الإنترنت.' };
      } else {
        throw { message: 'حدث خطأ غير متوقع' };
      }
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verify token with backend
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${AUTH_API}/verify`);
      return response.data.success;
    } catch (error) {
      // If token is invalid, logout user
      authService.logout();
      return false;
    }
  }
};

// Set token in axios if it exists when app loads
const token = authService.getToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default authService;