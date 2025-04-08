// contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService'; // Your authentication service

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user')
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Set token in your API service headers
          AuthService.setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to load authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { user, token, refreshToken } = await AuthService.login(
        email,
        password
      );

      // Store tokens and user data
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('refreshToken', refreshToken),
        AsyncStorage.setItem('user', JSON.stringify(user))
      ]);

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      AuthService.setAuthToken(token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear all stored data
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('refreshToken'),
        AsyncStorage.removeItem('user'),
      ]);

      // Reset state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      AuthService.clearAuthToken();
      
      // Optional: Call logout API if needed
      await AuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const { user, token, refreshToken } = await AuthService.register(userData);

      // Store tokens and user data
      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('refreshToken', refreshToken),
        AsyncStorage.setItem('user', JSON.stringify(user))
      ]);

      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      AuthService.setAuthToken(token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const { token, refreshToken: newRefreshToken } = await AuthService.refreshToken(storedRefreshToken);

      await Promise.all([
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('refreshToken', newRefreshToken)
      ]);

      setToken(token);
      AuthService.setAuthToken(token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
        refreshToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};