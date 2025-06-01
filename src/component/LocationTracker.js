
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, Platform, AppState } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import WebSocketService from '../service/WebSocketService';
import ApiClient from '../service/ApiClient';
import { LOCATION_TASK_NAME } from '../service/BackgroundLocationTask';
import * as SecureStore from 'expo-secure-store';

const LocationTracker = ({ token, userId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const appState = useRef(AppState.currentState);
  
  
 useEffect(() => {
  const initializeTracking = async () => {
    if (!token) {
      console.log('Waiting for token...');
      return;
    }
    
    
    ApiClient.setToken(token);
    
    
    try {
      await SecureStore.setItemAsync('authToken', token);
      console.log('Token stored securely for background tasks');
    } catch (error) {
      console.error('Failed to store token securely:', error);
    }

   
    setTimeout(async () => {
      if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          await startTracking();
        }
      }
    }, 1000);
  };

  initializeTracking();
}, [token]);

  
  useEffect(() => {
    if (token && userId) {
      WebSocketService.connect(token, userId);
    }
    
    return () => {
      WebSocketService.disconnect();
    };
  }, [token, userId]);

  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        
        checkTrackingStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  
  const checkTrackingStatus = useCallback(async () => {
    try {
      const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
        .catch(() => false);
      
      setIsTracking(isRegistered);
      
      if (isRegistered) {
        console.log('Location tracking is active');
      } else {
        console.log('Location tracking is not active');
        if (permissionsGranted) {
          startTracking();
        }
      }
    } catch (error) {
      console.error('Error checking tracking status:', error);
    }
  }, [permissionsGranted]);

  // Request location permissions
  const requestLocationPermission = useCallback(async () => {
    console.log('Requesting location permissions...');
    
    try {
      // First request foreground permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Foreground location permission is required for this app to work properly.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      // Then request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Permission Denied',
          'Background location permission is required for tracking when the app is not in use.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      console.log('All location permissions granted');
      setPermissionsGranted(true);
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, []);

  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      // Check if we already have permissions or need to request them
      if (!permissionsGranted) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;
      }

      // Check if tracking is already active
      const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
        .catch(() => false);
      
      if (isRegistered) {
        console.log('Location tracking is already active');
        setIsTracking(true);
        return;
      }

      // Start Background Location Updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced, // Use Balanced instead of Highest to save battery
        timeInterval: 30000, // 30 seconds
        distanceInterval: 50, // 50 meters
        deferredUpdatesInterval: 60000, // 1 minute between updates when backgrounded
        deferredUpdatesDistance: 50, // minimum 50 meters change when backgrounded
        deferredTimeout: 300000, // maximum 5 minutes between updates
        showsBackgroundLocationIndicator: true, // iOS only
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'GeoSphere is tracking your location',
          notificationColor: '#4A90E2',
        },
      });

      setIsTracking(true);
      console.log('Background Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', `Failed to start location tracking: ${error.message}`);
    }
  }, [permissionsGranted, requestLocationPermission]);

  // Stop location tracking
  const stopTracking = useCallback(async () => {
    try {
      const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
        .catch(() => false);
        
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('Background Location tracking stopped');
      }
      
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }, []);

  // Initialize tracking when component mounts
  useEffect(() => {
    if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
      requestLocationPermission().then(hasPermission => {
        if (hasPermission) {
          startTracking();
        }
      });
    } else {
      console.log("Task not defined, skipping tracking initialization");
    }
    
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  return null;
};

export default LocationTracker;
