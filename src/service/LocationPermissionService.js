import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

class LocationPermissionService {
  static async requestLocationPermissions() {
    if (Platform.OS === 'ios') {
      return await this.requestIOSPermissions();
    } else {
      return await this.requestAndroidPermissions();
    }
  }

  static async requestIOSPermissions() {
    try {
      // First request when in use permission
      const whenInUseStatus = await Geolocation.requestAuthorization('whenInUse');
      
      if (whenInUseStatus === 'granted') {
        // Then request always permission
        const alwaysStatus = await Geolocation.requestAuthorization('always');
        
        if (alwaysStatus === 'granted') {
          return { success: true, message: 'Location permissions granted' };
        } else {
          // Guide user to settings for always permission
          Alert.alert(
            'Background Location Required',
            'To track your location when the app is closed, please go to Settings and change location permission to "Always".',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return { success: false, message: 'Always location permission required' };
        }
      }
      
      return { success: false, message: 'Location permission denied' };
    } catch (error) {
      return { success: false, message: 'Error requesting permissions' };
    }
  }

  static async requestAndroidPermissions() {
    try {
      // Request fine location first
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to track you within geofences.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
        // For Android 10+ (API 29+), request background location
        if (Platform.Version >= 29) {
          const backgroundLocationGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message: 'To track your location when the app is in background, please allow background location access.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );

          if (backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED) {
            return { success: true, message: 'All location permissions granted' };
          } else {
            Alert.alert(
              'Background Location Required',
              'Please go to Settings > Apps > [App Name] > Permissions > Location and select "Allow all the time"',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return { success: false, message: 'Background location permission required' };
          }
        }
        
        return { success: true, message: 'Location permissions granted' };
      }

      return { success: false, message: 'Location permission denied' };
    } catch (error) {
      return { success: false, message: 'Error requesting permissions' };
    }
  }
}

export default LocationPermissionService;
