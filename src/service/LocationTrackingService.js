import Geolocation from 'react-native-geolocation-service';
import BackgroundJob from '@react-native-async-storage/async-storage';
import { UseApi } from '../hooks/UseApi';
import { useUser } from '../context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationTrackingService {
  static watchId = null;
  static isTracking = false;
  static lastKnownLocation = null;
  static api = null;
  static user = null;

  static initialize(api, user) {
    this.api = api;
    this.user = user;
    
    // Store token for background tasks
    if (user && user.token) {
      AsyncStorage.setItem('userToken', user.token);
    }
  }

  static async startLocationTracking() {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return;
    }

    try {
      this.watchId = Geolocation.watchPosition(
        (position) => {
          this.handleLocationUpdate(position);
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5, // Update every 5 meters
          interval: 10000, // Update every 10 seconds
          fastestInterval: 5000, // Fastest update every 5 seconds
          forceRequestLocation: true,
          forceLocationManager: false,
          showLocationDialog: true,
          useSignificantChanges: false,
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  static stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('Location tracking stopped');
    }
  }

  static async handleLocationUpdate(position) {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    
    // Check if location has changed significantly
    if (this.shouldUpdateLocation(latitude, longitude)) {
      this.lastKnownLocation = { latitude, longitude };
      
      // Send to backend
      await this.sendLocationToBackend({
        latitude,
        longitude,
        accuracy,
        speed: speed || 0,
        heading: heading || 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  static shouldUpdateLocation(newLat, newLng) {
    if (!this.lastKnownLocation) return true;
    
    const distance = this.calculateDistance(
      this.lastKnownLocation.latitude,
      this.lastKnownLocation.longitude,
      newLat,
      newLng
    );
    
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
      if (!this.api || !this.user) {
        console.error('API or user not initialized');
        return;
      }

      const response = await this.api.post('/geofence/locations/update', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading,
        timestamp: locationData.timestamp
      });

      console.log('Location sent to backend successfully');
    } catch (error) {
      console.error('Error sending location to backend:', error);
    }
  }
}

export default LocationTrackingService;
