import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      // Send location to backend
      await sendLocationToBackend({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed || 0,
        heading: location.coords.heading || 0,
        timestamp: new Date(location.timestamp).toISOString()
      });
    }
  }
});

const sendLocationToBackend = async (locationData) => {
  try {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('No token found for background location update');
      return;
    }

    // Replace with your actual backend URL
    const baseURL = 'http://192.168.164.74:8080'; 
    
    const response = await fetch(`${baseURL}/geofence/locations/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(locationData),
    });

    if (response.ok) {
      console.log('Background location sent successfully');
    } else {
      console.error('Failed to send background location:', response.status);
    }
  } catch (error) {
    console.error('Error sending background location:', error);
  }
};

export { LOCATION_TASK_NAME };

export const startBackgroundLocationTracking = async () => {  
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (foregroundStatus === 'granted' && backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000, // every 10 seconds
        distanceInterval: 5, // every 5 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Location Tracking Active',
          notificationBody: 'Your location is being shared with geofences',
          notificationColor: '#6C63FF',
        },
      });
      
      console.log('Background location tracking started');
      return true;
    } else {
      console.warn('Location permissions not granted');
      return false;
    }
  } catch (error) {
    console.error('Error starting background location tracking:', error);
    return false;
  }
};

export const stopBackgroundLocationTracking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location tracking stopped');
  } catch (error) {
    console.error('Error stopping background location tracking:', error);
  }
};
