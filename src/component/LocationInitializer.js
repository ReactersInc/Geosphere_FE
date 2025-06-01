// In your HomeScreen.js or create a new component
import React, { useEffect } from 'react';
import { useUser } from '../context/userContext';
import LocationTrackingService from '../service/LocationTrackingService';
import WebSocketService from '../service/WebSocketService';
import { UseApi } from '../hooks/UseApi';

const LocationInitializer = ({ children }) => {
  const { user, token } = useUser();
  const api = UseApi();

  useEffect(() => {
    if (user && token) {
      // Initialize location tracking service
      LocationTrackingService.initialize(api, user);
      
      // Connect to WebSocket
      WebSocketService.connect(token, user.userId);
    }

    return () => {
      // Cleanup on unmount
      LocationTrackingService.stopLocationTracking();
      WebSocketService.disconnect();
    };
  }, [user, token]);

  return children;
};

export default LocationInitializer;
