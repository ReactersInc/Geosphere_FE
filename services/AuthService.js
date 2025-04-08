// services/AuthService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://makemytwin.com/'; // Replace with your API base URL

// Helper function for API requests
const apiRequest = async (endpoint, method, body = null, requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

const AuthService = {
  // Set auth token for requests
  setAuthToken: async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to set auth token:', error);
    }
  },

  // Clear auth token
  clearAuthToken: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('IoMTAppAPI//api/loginGeoUser.php', 'POST', { email, password }, false);
  },

  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', 'POST', userData, false);
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout API if needed
      await apiRequest('/auth/logout', 'POST');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return apiRequest('/auth/refresh-token', 'POST', { refreshToken }, false);
  },

  // Get current user profile
  getProfile: async () => {
    return apiRequest('/users/me', 'GET');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiRequest('/users/me', 'PATCH', userData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/users/change-password', 'POST', {
      currentPassword,
      newPassword
    });
  },

  // Request password reset
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', 'POST', { email }, false);
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return apiRequest('/auth/reset-password', 'POST', { token, newPassword }, false);
  }
};

export default AuthService;