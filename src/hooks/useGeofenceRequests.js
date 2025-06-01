// hooks/useGeofenceRequests.js
import { useState, useEffect, useContext } from 'react';
import { UseApi } from '../hooks/UseApi';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingContext } from '../context/LoadingProvider';

export const useGeofenceRequests = (initialPage = 0, initialSize = 10) => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: initialSize,
    totalElements: 0,
    totalPages: 0
  });

  const {loading, setLoading} = useContext(LoadingContext); // Assuming you have a LoadingContext to manage loading state
  
  const api = UseApi();
  
  const fetchGeofenceRequests = async (page = 0, size = 10) => {
    try {
      const result = await api.get(`/geofence/get-geofence-request?page=${page}&size=${size}`);
      
      if (result.result.responseCode === 200) {
        setRequests(result.data.list);
        setPagination({
          page: result.data.page,
          size: result.data.size,
          totalElements: result.data.totalElements,
          totalPages: result.data.totalPages
        });
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGeofenceRequests(initialPage, initialSize);
  }, [initialPage, initialSize]);
  
  return {
    requests,
    loading,
    error,
    pagination,
    refetch: fetchGeofenceRequests
  };
};

export const useGeofenceRequestActions = () => {
  const api = UseApi();
  
  const acceptRequest = async (requestId) => {
    try {
      const result = await api.post(`/geofence/accept-request/${requestId}`, {});
      
      if (result.result.responseCode === 200) {
        // Store token for background tasks FIRST
        const userToken = await AsyncStorage.getItem('authToken'); // or whatever key you use
        if (userToken) {
          await AsyncStorage.setItem('userToken', userToken);
          console.log('Token stored for background tasks');
        }

        // Get current location for immediate update
        let currentLocation;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Highest
            });
            
            currentLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speed: location.coords.speed || 0,
              heading: location.coords.heading || 0,
              deviceInfo: `${Platform.OS} ${Platform.Version}`
            };
          }
        } catch (locError) {
          console.error("Error getting current location:", locError);
          currentLocation = {
            latitude: 12.9103818,
            longitude: 77.6322964,
            speed: 0,
            heading: 0,
            deviceInfo: `${Platform.OS} ${Platform.Version}`
          };
        }

        // Send immediate location update
        const locationResult = await api.post('/geofence/locations/update', currentLocation);
        
        if (locationResult.result.responseCode === 200) {
          // Start continuous location tracking
          await startLocationTracking();
          
          return { success: true, message: 'Request accepted and location tracking started' };
        } else {
          return { success: false, message: locationResult.result.responseDescription || 'Failed to update location' };
        }
      } else {
        return { success: false, message: result.result.responseDescription || 'Failed to accept request' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'An error occurred' };
    }
  };
  
  const declineRequest = async (requestId) => {
    try {
      const result = await api.post(`/geofence/reject-request/${requestId}`, {});
      
      if (result.result.responseCode === 200) {
        return { success: true, message: 'Request declined successfully' };
      } else {
        return { success: false, message: result.result.responseDescription || 'Failed to decline request' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'An error occurred' };
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (foregroundStatus === 'granted' && backgroundStatus === 'granted') {
        // Import the task name dynamically to avoid require() issues
        const LOCATION_TASK_NAME = 'background-location-task';
        
        // Start Background Location Updates
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 10000, // every 10 sec
          distanceInterval: 5, // every 5 meters
          showsBackgroundLocationIndicator: true, // iOS only
          foregroundService: {
            notificationTitle: 'Location Tracking',
            notificationBody: 'Your location is being shared',
            notificationColor: '#FF0000',
          },
        });
        
        console.log('Background Location tracking started after accepting request');
      } else {
        console.warn('Location permissions not granted for background tracking');
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };
  
  return {
    acceptRequest,
    declineRequest
  };
};
