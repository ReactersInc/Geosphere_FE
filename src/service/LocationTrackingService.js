import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Background location task name
const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Define the background location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    console.log('Background location update:', locations);
    
    // Handle background location updates
    locations.forEach(async (location) => {
      try {
        // Get stored user data for background processing
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          // Process location update in background
          LocationTrackingService.handleLocationUpdate(location);
        }
      } catch (error) {
        console.error('Error processing background location:', error);
      }
    });
  }
});

class LocationTrackingService {
  static watchSubscription = null;
  static isTracking = false;
  static lastKnownLocation = null;
  static api = null;
  static user = null;
  static locationUpdateTimer = null;
  static backgroundLocationTask = null;

  static initialize(api, user) {
    console.log('LocationTrackingService initialized with:', { 
      hasApi: !!api, 
      hasUser: !!user,
      userId: user?.userId 
    });
    
    this.api = api;
    this.user = user;
    
    // Store user data for background tasks
    if (user) {
      AsyncStorage.setItem('userData', JSON.stringify(user));
    }
  }

  static async startLocationTracking() {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return;
    }

    if (!this.api || !this.user) {
      console.error('LocationTrackingService not properly initialized');
      return;
    }

    try {
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        console.error('Location permission not granted');
        return;
      }

      console.log('Starting location watch...');
      
      // Start watching position with Expo Location
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 15000, // Update every 15 seconds
          distanceInterval: 5, // Update every 5 meters
          mayShowUserSettingsDialog: true,
        },
        (position) => {
          console.log('Location update received:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          this.handleLocationUpdate(position);
        }
      );

      this.isTracking = true;
      console.log('Location tracking started successfully');

      // Fallback: Also get location every 30 seconds to ensure we're sending updates
      this.startPeriodicLocationUpdates();

      // Start background location tracking if permission is granted
      await this.startBackgroundLocationTracking();

    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTracking = false;
    }
  }

  static async startBackgroundLocationTracking() {
    try {
      const { status } = await Location.getBackgroundPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Starting background location task...');
        
        // Define background location task
        this.backgroundLocationTask = await Location.startLocationUpdatesAsync(
          BACKGROUND_LOCATION_TASK,
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Every 30 seconds in background
            distanceInterval: 10, // Every 10 meters in background
            foregroundService: {
              notificationTitle: 'Location Tracking',
              notificationBody: 'App is tracking your location in the background',
              notificationColor: '#FF0000',
            },
            pausesUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
          }
        );
        
        console.log('Background location tracking started');
      } else {
        console.log('Background location permission not granted, using foreground only');
      }
    } catch (error) {
      console.error('Error starting background location tracking:', error);
    }
  }

  static startPeriodicLocationUpdates() {
    if (this.locationUpdateTimer) {
      clearInterval(this.locationUpdateTimer);
    }

    this.locationUpdateTimer = setInterval(async () => {
      if (this.isTracking) {
        try {
          const position = await this.getCurrentPosition();
          this.handleLocationUpdate(position);
        } catch (error) {
          console.error('Periodic location update failed:', error);
        }
      }
    }, 30000); // Every 30 seconds
  }

  static async getCurrentPosition() {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 10000, // Accept cached location up to 10 seconds old
      });
      return position;
    } catch (error) {
      console.error('Error getting current position:', error);
      throw error;
    }
  }

  static async checkLocationPermission() {
    try {
      console.log('Checking location permissions...');
      
      // Check foreground location permission
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Requesting foreground location permission...');
        const result = await Location.requestForegroundPermissionsAsync();
        status = result.status;
      }

      console.log('Foreground location permission:', status);
      
      if (status !== 'granted') {
        console.error('Foreground location permission not granted');
        return false;
      }

      // Check background location permission (optional)
      const backgroundResult = await Location.getBackgroundPermissionsAsync();
      console.log('Background location permission:', backgroundResult.status);
      
      if (backgroundResult.status !== 'granted') {
        console.log('Requesting background location permission...');
        const requestResult = await Location.requestBackgroundPermissionsAsync();
        console.log('Background permission request result:', requestResult.status);
        
        if (requestResult.status !== 'granted') {
          console.warn('Background location permission not granted - tracking may be limited when app is backgrounded');
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  static async stopLocationTracking() {
    console.log('Stopping location tracking...');

    // Stop watching position
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      console.log('Location watch subscription removed');
    }

    // Stop periodic updates
    if (this.locationUpdateTimer) {
      clearInterval(this.locationUpdateTimer);
      this.locationUpdateTimer = null;
      console.log('Periodic location updates stopped');
    }

    // Stop background location tracking
    try {
      const hasStartedLocationUpdates = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      if (hasStartedLocationUpdates) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('Background location tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping background location tracking:', error);
    }

    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  static async handleLocationUpdate(position) {
    try {
      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      
      console.log('Processing location update:', {
        lat: latitude,
        lng: longitude,
        accuracy: accuracy
      });

      // Check if location has changed significantly
      if (this.shouldUpdateLocation(latitude, longitude)) {
        this.lastKnownLocation = { latitude, longitude };
        
        const locationData = {
          latitude,
          longitude,
          accuracy: accuracy || 0,
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date().toISOString()
        };

        console.log('Sending location to backend:', locationData);
        
        // Send to backend
        await this.sendLocationToBackend(locationData);
      } else {
        console.log('Location change too small, skipping update');
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  static shouldUpdateLocation(newLat, newLng) {
    if (!this.lastKnownLocation) {
      console.log('No previous location, sending update');
      return true;
    }
    
    const distance = this.calculateDistance(
      this.lastKnownLocation.latitude,
      this.lastKnownLocation.longitude,
      newLat,
      newLng
    );
    
    console.log('Distance from last location:', distance.toFixed(2), 'meters');
    
    // Update if moved more than 5 meters
    return distance > 5;
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  static async sendLocationToBackend(locationData) {
    try {
      if (!this.api) {
        console.error('API not available for location update');
        return;
      }

      if (!this.user) {
        console.error('User not available for location update');
        return;
      }

      console.log('Sending location to backend with data:', locationData);

      const response = await this.api.post('/geofence/locations/update', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading,
        // timestamp: locationData.timestamp
      });

      if (response && response.data) {
        console.log('✅ Location sent to backend successfully:', response.data);
      } else {
        console.log('✅ Location sent to backend successfully (no response data)');
      }

    } catch (error) {
      console.error('❌ Error sending location to backend:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // If it's a network error, we might want to retry later
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('Network error detected, will retry on next location update');
      }
    }
  }

  static async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  static isLocationTrackingActive() {
    return this.isTracking;
  }

  static getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  // Helper method to check if location services are enabled
  static async isLocationServicesEnabled() {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      console.log('Location services enabled:', enabled);
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }
}

export default LocationTrackingService;