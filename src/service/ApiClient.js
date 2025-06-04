// service/ApiClient.js - Enhanced version
import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/constant';

class ApiClient {
  static instance = null;
  static token = null;
  static refreshToken = null;
  static tokenRefreshPromise = null;
  
  static getInstance() {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  static setToken(token, refreshToken = null) {
    ApiClient.token = token;
    if (refreshToken) {
      ApiClient.refreshToken = refreshToken;
    }
  }

   static async ensureToken() {
    if (!ApiClient.token) {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) {
          ApiClient.token = storedToken;
          console.log('Token loaded from secure storage');
          return true;
        }
      } catch (error) {
        console.error('Failed to load token from storage:', error);
      }
      return false;
    }
    return true;
  }
  
  async post(endpoint, data) {
    // Ensure token is available before making request
    const hasToken = await ApiClient.ensureToken();
    if (!hasToken) {
      throw new Error('No authentication token available');
    }
    
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'POST', endpoint);
      throw error;
    }
  }
  
  constructor() {
    const baseURL = __DEV__ 
      ? `${API_BASE_URL}` 
      : 'https://your-production-domain.com';
      
    this.client = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `GeoSphere/${Platform.OS}/${Platform.Version}`,
      },
    });

    
    
    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (ApiClient.token) {
          config.headers.Authorization = `Bearer ${ApiClient.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token expiration
        if (error.response?.status === 401 && !originalRequest._retry && ApiClient.refreshToken) {
          if (!ApiClient.tokenRefreshPromise) {
            ApiClient.tokenRefreshPromise = this.refreshAuthToken();
          }
          
          try {
            const newToken = await ApiClient.tokenRefreshPromise;
            ApiClient.tokenRefreshPromise = null;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            return this.client(originalRequest);
          } catch (refreshError) {
            ApiClient.tokenRefreshPromise = null;
            // Handle refresh token failure
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  async refreshAuthToken() {
    try {
      const response = await this.client.post('/auth/refresh-token', {
        refreshToken: ApiClient.refreshToken
      });
      
      const newToken = response.data.data.token;
      ApiClient.token = newToken;
      return newToken;
    } catch (error) {
      // Clear tokens on refresh failure
      ApiClient.token = null;
      ApiClient.refreshToken = null;
      throw error;
    }
  }
  
  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'POST', endpoint);
      throw error;
    }
  }
  
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'GET', endpoint);
      throw error;
    }
  }
  
  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'PUT', endpoint);
      throw error;
    }
  }
  
  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'DELETE', endpoint);
      throw error;
    }
  }
  
  handleApiError(error, method, endpoint) {
    if (error.response) {
      console.error(`API Error (${method} ${endpoint}): Status ${error.response.status}`, 
        error.response.data);
    } else if (error.request) {
      console.error(`API Error (${method} ${endpoint}): No response received`, error.request);
    } else {
      console.error(`API Error (${method} ${endpoint}): ${error.message}`);
    }
  }
}

export default ApiClient;
