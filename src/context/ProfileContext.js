import React, { createContext, useState, useEffect, useContext } from 'react';
import { useUser } from './userContext';
import { UseApi } from '../hooks/UseApi';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user, token, isAuthenticated, logout } = useUser();
  const { get } = UseApi();
  
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!token || !isAuthenticated) {
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const response = await get('/user');
      
      if (response?.data) {
        setProfile(response.data);
      } else {
        throw new Error('Profile data not found');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfileError(error.message);
      
      // Force logout if profile fetch fails (indicates invalid token or user)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Profile fetch failed - forcing logout');
        await logout();
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Clear profile data
  const clearProfile = () => {
    setProfile(null);
    setProfileError(null);
  };

  // Fetch profile when user logs in
  useEffect(() => {
    if (isAuthenticated && token && user) {
      fetchProfile();
    } else {
      clearProfile();
    }
  }, [isAuthenticated, token, user]);

  // Clear profile when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearProfile();
    }
  }, [isAuthenticated]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileLoading,
        profileError,
        fetchProfile,
        refreshProfile,
        clearProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
