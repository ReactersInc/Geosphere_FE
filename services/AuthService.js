import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../src/config/constant';

const apiRequest = async (endpoint, method, body = null, requiresAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  let token;
  if (requiresAuth) {
    try {
      token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('Authentication token not found');
      }
    } catch (error) {
      console.error('Token retrieval error:', error);
      throw new Error('Failed to retrieve authentication token');
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Request failed' };
      }
      const errorMessage = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw new Error(error.message || 'Network request failed. Please check your connection.');
  }
};

const AuthService = {
  setAuthToken: async (token) => {
    try {
      if (!token) throw new Error('No token provided');
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to set auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  clearAuthToken: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
      throw new Error('Failed to clear authentication token');
    }
  },

  // Login user
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    try {
      const response = await apiRequest('IoMTAppAPI//api/loginGeoUser.php', 'POST', { 
        email, 
        password 
      }, false);
      
      if (!response.user || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
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