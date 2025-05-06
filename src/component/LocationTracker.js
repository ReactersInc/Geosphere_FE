// components/LocationTracker.js
import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import WebSocketService from '../service/WebSocketService';
import { UseApi } from '../hooks/UseApi';
import { LOCATION_TASK_NAME } from '../service/BackgroundLocationTask';

const LocationTracker = ({ token, userId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const { post } = UseApi();
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    WebSocketService.connect(token, userId);

    return () => {
      WebSocketService.disconnect();
      stopTracking();
    };
  }, [token, userId]);

  console.log("tracker running....")

  const requestLocationPermission = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Location permissions are required');
      return false;
    }
    return true;
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return;
    }

    setIsTracking(true);

    // Start Background Location Updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 10000, // every 10 sec
      distanceInterval: 5, // every 5 meters
      showsBackgroundLocationIndicator: true, // iOS only
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'Location is being tracked in background',
        notificationColor: '#FF0000',
      },
    });

    console.log('Background Location tracking started');
  };

  const stopTracking = async () => {
    setIsTracking(false);

    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background Location tracking stopped');
    }
  };

  return null;
};

export default LocationTracker;
