// services/NotificationService.js
import { Alert } from 'react-native';
import WebSocketService from './WebSocketService';

class NotificationService {
  init(token, userId) {
    // Subscribe to geofence notifications
    WebSocketService.subscribeToGeofenceEvents(userId, this.handleNotification);
  }

  handleNotification = (message) => {
    const notification = JSON.parse(message.body);
    
    switch (notification.type) {
      case 'GEOFENCE_ENTRY':
        Alert.alert(
          'Geofence Entry',
          `You've entered ${notification.geofenceName}`,
          [{ text: 'OK' }]
        );
        break;
      case 'GEOFENCE_EXIT':
        Alert.alert(
          'Geofence Exit',
          `You've exited ${notification.geofenceName}`,
          [{ text: 'OK' }]
        );
        break;
      default:
        console.log('Unknown notification type:', notification.type);
    }
  };
}

export default new NotificationService();